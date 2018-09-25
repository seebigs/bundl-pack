var fs = require('fs');
var Module = require('module');
Module._extensions['.template'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var each = require('seebigs-each');
var getGlobals = require('./globals.js').get;
var requirer = require('./requirer.js');
var template = require('lodash.template')(require('./pack.template'));


function escapeRegExp (s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function wrapModule (mod, modules, opts) {
    var leadingComment = opts.leadingComments === false ? '\n\n' : '/*** [' + (mod.id) + '] ' + mod.path + ' ***/\n\n';
    var modName = opts.obscure ? '' : (mod.name ? ',' + "'" + mod.name + "'" : '');
    var modOpener = '[(function (require, module, exports) {\n';
    var modCloser = '\n\n}),';
    var contentsToWrap = mod.contents; // create a new ref here so we don't modify the original module contents

    var map = {};
    each(mod.relMap, function (abs, rel) {
        var m = modules[abs];
        var coord = m ? m.id : 0;
        if (opts.obscure) {
            var matchReq = new RegExp('require\\([\\\'\\"]' + escapeRegExp(rel) + '[\\\'\\"]\\)', 'g');
            contentsToWrap = contentsToWrap.replace(matchReq, 'require(' + coord + ')');
            map[coord] = coord;
        } else {
            map[rel] = coord;
        }
    });

    var modStr = modOpener + leadingComment + contentsToWrap + modCloser;
    modStr += JSON.stringify(map);
    modStr += modName;
    return modStr + '],\n';
}

function writeRequireAs (requireAs) {
    if (Object.keys(requireAs).length) {
        var asStr = ', {';

        each(requireAs, function (fn, ext) {
            asStr += '\n' + ext + ': ' + fn.toString() + ',';
        });

        return asStr.slice(0, -1) + '\n}';
    }

    return '';
}

function packModules (found, entryMod, opts) {
    var foundModules = found.modules;
    var codeStr = '';

    // prepare module ids
    var modId = 1;
    each(foundModules, function (mod) {
        mod.id = modId;
        modId++;
    });

    // pull entry module to the top
    entryMod.id = 0;
    codeStr += wrapModule(entryMod, foundModules, opts);
    delete foundModules[entryMod.path];

    // add each module
    each(foundModules, function (mod) {
        codeStr += wrapModule(mod, foundModules, opts);
    });

    // drop trailing comma
    codeStr = codeStr.slice(0, -2);

    // insert node globals if used
    var globals = getGlobals(codeStr);
    var extraLines = 0;
    if (globals.first) {
        extraLines = globals.first.split('\n').length - 1;
    }

    var onFirstRequire = opts.invokeOnFirstRequire ? '\nrequire.onFirstRequire = function(){\n   ' + opts.invokeOnFirstRequire + '.apply({}, arguments);\n};\n' : '';

    // wrap modules before/after
    codeStr = template({
        globalsTop: globals.top,
        globalsFirst: globals.first,
        globalsBottom: globals.bottom,
        globalVarFinder: globals.varFinder,
        requirer: requirer.toString(),
        modules: codeStr,
        requireAs: writeRequireAs(found.requireAs),
        onFirstRequire: onFirstRequire,
    });

    return {
        code: codeStr,
        insertExtraLines: extraLines,
    };
}

module.exports = packModules;
