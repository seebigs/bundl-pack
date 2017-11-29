var fs = require('fs');
var Module = require('module');
Module._extensions['.template'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var getGlobals = require('./globals.js').get;
var requirer = require('./requirer.js');
var template = require('lodash.template')(require('./pack.template'));
var utils = require('seebigs-utils');


function escapeRegExp (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function wrapModule (mod, modules, opts) {
    var leadingComment = opts.leadingComments === false ? '\n\n' : '/*** [' + (mod.id) + '] ' + mod.path + ' ***/\n\n';
    var modOpener = '[function (require, module, exports) {\n';
    var modCloser = '\n\n\n},';

    var map = {};
    utils.each(mod.relMap, function (abs, rel) {
        var m = modules[abs];
        var coord = m ? m.id : 0;
        if (opts.obscure) {
            var matchReq = new RegExp('require\\([\\\'\\"]' + escapeRegExp(rel) + '[\\\'\\"]\\)', 'g');
            mod.contents = mod.contents.replace(matchReq, 'require(' + coord + ')');
            map[coord] = coord;
        } else {
            map[rel] = coord;
        }
    });

    var modStr = modOpener + leadingComment + mod.contents + modCloser;
    modStr += JSON.stringify(map);
    return modStr + '],\n';
}

function writeRequireAs (requireAs) {
    if (Object.keys(requireAs).length) {
        var asStr = ', {';

        utils.each(requireAs, function (fn, ext) {
            asStr += '\n' + ext + ': ' + fn.toString() + ',';
        });

        return asStr.slice(0, -1) + '\n}';
    }

    return '';
}

function packModules (found, entryMod, opts) {
    var foundModules = found.modules;
    var codeStr = '';

    // add entry module
    codeStr += wrapModule(entryMod, foundModules, opts);

    // add each
    utils.each(foundModules, function (mod) {
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

    // wrap modules before/after
    codeStr = template({
        globalsTop: globals.top,
        globalsFirst: globals.first,
        globalsBottom: globals.bottom,
        requirer: requirer.toString(),
        modules: codeStr,
        requireAs: writeRequireAs(found.requireAs)
    });

    return {
        code: codeStr,
        insertExtraLines: extraLines,
    };
}

module.exports = packModules;
