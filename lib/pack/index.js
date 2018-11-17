var fs = require('fs');
var Module = require('module');
Module._extensions['.template'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var each = require('seebigs-each');
var getGlobals = require('./globals.js').get;
var sourcemap = require('../sourcemap');
var requirer = require('./requirer.js');
var template = require('lodash.template')(require('./pack.template'));
var wrapModule = require('./wrapModule.js');

var innerWrapperHeight = 5;

function getRequireAs(includedExt, cached) {
    var requireAs = [];
    each(includedExt, function (ext) {
        var requireAsFn = cached[ext];
        if (requireAsFn) {
            requireAs.push({
                ext: ext,
                fn: requireAsFn,
            });
        }
    });

    if (requireAs.length) {
        var asStr = ', {';

        each(requireAs, function (reqAs) {
            asStr += '\n' + reqAs.ext + ': ' + reqAs.fn.toString() + ',';
        });

        return asStr.slice(0, -1) + '\n}';

    } else {
        return '';
    }
}

function packModules(store, cache, entryPath, mapDependency, cumulativeLines, options) {
    var modules = store.modules;
    var codeStr = '';
    var sourcemaps = [];

    var onFirstRequire = '';
    if (options.invokeOnFirstRequire) {
        onFirstRequire = '\nrequire.onFirstRequire = function(){\n   ' + options.invokeOnFirstRequire + '.apply({}, arguments);\n};\n\n';
        cumulativeLines += sourcemap.countLines(onFirstRequire);
    }

    // Prepare entry module (pull entry to top, override id=0)
    var entryMod = modules[entryPath];
    entryMod.id = 0;
    delete modules[entryPath];
    mapDependency(entryMod.path);

    // Prepare other modules for packing
    var modId = 1;
    each(modules, function (mod) {
        mod.id = modId;
        modId++;
        mapDependency(mod.path);
    });

    // Wrap and add entry module
    var wrappedEntry = wrapModule(entryMod, modules, options);
    codeStr += wrappedEntry;
    var entrySourcemap = sourcemap.create(entryMod, cumulativeLines);
    cumulativeLines += entrySourcemap.totalLines + innerWrapperHeight;
    sourcemaps.push(entrySourcemap);

    // Wrap and add all other modules
    each(modules, function (mod) {
        var wrappedModule = wrapModule(mod, modules, options);
        codeStr += wrappedModule;
        var modSourcemap = sourcemap.create(mod, cumulativeLines);
        cumulativeLines += modSourcemap.totalLines + innerWrapperHeight;
        sourcemaps.push(modSourcemap);
    });

    // drop trailing comma
    codeStr = codeStr.slice(0, -2);

    // insert node globals if used
    var globals = getGlobals(codeStr);

    // insert requireAs if used
    var requireAs = getRequireAs(Object.keys(store.extensions), cache.requireAs);

    // wrap modules before/after
    codeStr = template({
        globalsTop: globals.top,
        globalsBottom: globals.bottom,
        globalVarFinder: globals.varFinder,
        requirer: requirer.toString(),
        modules: codeStr,
        requireAs: requireAs,
        onFirstRequire: onFirstRequire,
    });

    return {
        code: codeStr,
        sourcemaps: sourcemaps
    };
}

module.exports = packModules;
