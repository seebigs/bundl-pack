/**
 * Bundl plugin to package 'required' dependencies
 */

var constructEntryFile = require('./lib/construct_entry_file.js');
var extractEntryModule = require('./lib/extract_entry_module.js');
var findModules = require('./lib/find_modules.js');
var packModules = require('./lib/pack_modules.js');
var utils = require('seebigs-utils');

var topWrapperHeight = 4;

function bundlPack (options) {
    var opts = Object.assign({}, options);

    /**
     * @param {String} contents the initial contents of the file being processed
     * @option {Object} r the resource object being processed
     */
    function exec (r) {
        var _this = this;
        var startingLines = _this.isBundl ? _this.LINES || 1 : 1;
        var initialLines = startingLines + topWrapperHeight + 1;
        var initialFound = {
            modules: {},
            requireAs: {},
        };

        if (r.contents && r.contents.tree) {
            var entryFile = constructEntryFile(r);
            var found = findModules(initialFound, entryFile, opts, true, initialLines);
            var entryMod = extractEntryModule(found, entryFile);
            var packed = packModules(found, entryMod, opts);

            if (packed.insertExtraLines) {
                r.sourcemaps.forEach(function (smap) {
                    smap.generated.line += packed.insertExtraLines;
                });
            }

            utils.each(found.modules, function (mod, modPath) {

                // map dependency to Bundl
                if (_this.isBundl) {
                    _this.mapDependency.call(_this, r.name, modPath);
                }
                // add sourcemap to resource
                r.sourcemaps.push(mod.sourcemap);

            });

            // parse new AST from our packaged string and save into resource contents
            r.contents.tree.parse(packed.code);
        }

        return r;
    }

    return {
        name: 'pack',
        stage: 'parsed',
        ext: ['js'],
        exec: exec,
    };

}

module.exports = bundlPack;
