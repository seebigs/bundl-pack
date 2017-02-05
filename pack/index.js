/**
 * Crawl a target JS file for dependencies and package them for runtime usage
 */

var crawl = require('./crawl.js');
var fs = require('fs');
var Module = require('module');
var path = require('path');
var prelude = require('./prelude.js');
var utils = require('seebigs-utils');

// template
Module._extensions['.template'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var template = require('lodash.template')(require('./pack.template'));


function wrapModule (mod, pack, options) {
    var leadingComment = '/*** [' + (mod.id) + '] ' + mod.path + ' ***/\n\n';
    var modOpener = '/***/[function (require, module, exports) {\n';
    var modCloser = '\n\n\n/***/},';

    var map = {};
    utils.each(mod.relMap, function (abs, rel) {
        var m = pack[abs];
        var coord = m ? m.id : 0;
        if (options.obscure) {
            var matchReq = new RegExp('require\\([\\\'\\"]' + rel + '[\\\'\\"]\\)', 'g');
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

function create (resource, options) {
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
        entryFile.srcArray = resource.src; // array of src inputs
    }

    // track which requireAs should be included
    var requireAs = {};

    // walk the tree and build `pack`
    var pack = crawl(options, entryFile, {}, requireAs, true);

    // add pack to changemap
    var changemap = {};
    utils.each(pack, function (mod, modPath) {
        changemap[modPath] = resource.name;
    });

    // add entry module
    var entryMod = pack[entryFile.path];
    entryMod.id = 0;
    modulesStr += wrapModule(entryMod, pack, options);
    delete pack[entryFile.path];

    // add modules
    utils.each(pack, function (mod) {
        modulesStr += wrapModule(mod, pack, options);
    });

    // drop trailing comma
    modulesStr =  modulesStr.slice(0, -2);

    // wrap modules before/after
    modulesStr = template({
        globals: 'window, document',
        prelude: prelude.toString(),
        modules: modulesStr,
        requireAs: writeRequireAs(requireAs)
    });

    return {
        changemap: changemap,
        contents: modulesStr
    };
}


module.exports = create;
