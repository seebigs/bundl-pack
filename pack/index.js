/**
 * Crawl a target JS file for dependencies and package them for runtime usage
 */

var crawl = require('./crawl.js');
var fs = require('fs');
var getGlobals = require('./globals.js').get;
var Module = require('module');
var path = require('path');
var requirer = require('./requirer.js');
var utils = require('seebigs-utils');

// template
Module._extensions['.template'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var template = require('lodash.template')(require('./pack.template'));


var topWrapperHeight = 4;

function escapeRegExp (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function wrapModule (mod, pack, options) {
    var leadingComment = options.leadingComments === false ? '\n\n' : '/*** [' + (mod.id) + '] ' + mod.path + ' ***/\n\n';
    var modOpener = '/***/[function (require, module, exports) {\n';
    var modCloser = '\n\n\n/***/},';

    var map = {};
    utils.each(mod.relMap, function (abs, rel) {
        var m = pack[abs];
        var coord = m ? m.id : 0;
        if (options.obscure) {
            var matchReq = new RegExp('require\\([\\\'\\"]' + escapeRegExp(rel) + '[\\\'\\"]\\)', 'g');
            mod.contents = mod.contents.replace(matchReq, 'require(' + coord + ')');
            var matchReqMock = new RegExp('require\\.cache\\.mock\\([\\\'\\"]' + escapeRegExp(rel) + '[\\\'\\"],', 'g');
            mod.contents = mod.contents.replace(matchReqMock, 'require.cache.mock(' + coord + ',');
            map[coord] = coord;
        } else {
            map[rel] = coord;
        }
    });

    var modStr = modOpener + leadingComment + mod.contents + modCloser;
    modStr += JSON.stringify(map);
    return modStr + '],\n';
}

// bundle any requireAs functions
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


/**
 * Pack your dependencies
 * @param {Object} resource { name, contents, src }
 * @option {Object} options
 * @return { contents, changemap }
 */

function create (b, resource, options) {
    resource.src = resource.src || [];
    options = options || {};

    var modulesStr = '';
    var concatenatedEntryName = '#entry';
    var entryFile = {
        contents: resource.contents
    };

    if (resource.src.length === 1 && typeof resource.src[0] === 'string') {
        entryFile.path = resource.src[0];
        entryFile.base = path.dirname(entryFile.path);

    } else {
        entryFile.path = concatenatedEntryName;
    }

    // track which requireAs should be included
    var requireAs = {};

    // walk the tree and build `pack`
    var pack = crawl(options, entryFile, {}, requireAs, true, (b.LINES || 1) + topWrapperHeight + 1);

    // wrap the #entry module and remove it from the pack
    var entryMod = pack[entryFile.path];
    entryMod.id = 0;
    modulesStr += wrapModule(entryMod, pack, options);
    delete pack[entryFile.path];

    // add pack to changemap
    var changemap = {};
    utils.each(pack, function (mod, modPath) {
        changemap[modPath] = resource.name;
    });

    // add modules + sourcemaps
    resource.sourcemaps.forEach(function (smap) {
        smap.generated.line += topWrapperHeight; // push down to allow for wrapper
    });

    utils.each(pack, function (mod) {
        resource.sourcemaps.push(mod.sourcemap);
        modulesStr += wrapModule(mod, pack, options);
    });

    // drop trailing comma
    modulesStr =  modulesStr.slice(0, -2);

    // Insert node globals if used
    var globals = getGlobals(modulesStr);
    if (globals.first) {
        var extra = globals.first.split('\n').length - 1;
        resource.sourcemaps.forEach(function (smap) {
            smap.generated.line += extra;
        });
    }

    // wrap modules before/after
    modulesStr = template({
        globalsTop: globals.top,
        globalsFirst: globals.first,
        globalsBottom: globals.bottom,
        requirer: requirer.toString(),
        modules: modulesStr,
        requireAs: writeRequireAs(requireAs)
    });

    return {
        changemap: changemap,
        contents: modulesStr,
        sourcemaps: resource.sourcemaps
    };
}


module.exports = create;
