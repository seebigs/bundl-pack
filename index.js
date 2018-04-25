/**
 * Bundl plugin to package 'required' dependencies
 */

var constructEntryFile = require('./lib/construct_entry_file.js');
var findModules = require('./lib/find_modules.js');
var packModules = require('./lib/pack_modules.js');
var requirer = require('./lib/requirer.js');
var utils = require('seebigs-utils');

var topWrapperHeight = 4;

function bundlPack (options) {
    var opts = Object.assign({}, options);

    /**
     * @param {Object} r the resource object being processed
     *   (must contain r.contents.parsed as ParseTree instance)
     */
    function exec (r) {
        var _this = this;
        var startingLines = _this.isBundl ? _this.LINES || 1 : 1;
        var initialLines = startingLines + topWrapperHeight + 1;

        if (r.contents && r.contents.string) {
            var entryFile = constructEntryFile(r, r.contents.string);
            var found = findModules(entryFile, opts, initialLines);
            entryFile.relMap = found.relMap;
            var packed = packModules(found, entryFile, opts);

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

            // replace contents with our packaged code
            r.contents.string = packed.code;
        }

        return r;
    }

    return {
        name: 'pack',
        stage: 'stringy',
        ext: ['js'],
        exec: exec,
    };

}

bundlPack.requirer = requirer;

module.exports = bundlPack;
