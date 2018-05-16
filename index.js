/**
 * Bundl plugin to package 'required' dependencies
 */

var each = require('seebigs-each');
var getEntryModule = require('./lib/entry');
var findModules = require('./lib/find');
var packModules = require('./lib/pack');
var requirer = require('./lib/pack/requirer.js');

function bundlPack(options) {
    var opts = Object.assign({}, options);

    var modulesCache = {};

    /**
     * @param {Object} r the resource object being processed
     *   (must contain r.contents)
     */
    function exec(r) {
        var _this = this;
        var startingLines = _this.isBundl ? _this.LINES || 1 : 1;
        var cumulativeLines = startingLines + 5;
        var requireAs = {};

        if (r.changed) {
            modulesCache = {};
        }

        if (r.contents) {
            var contentsString = r.contents.getString();
            if (contentsString) {
                var entryMod = getEntryModule(r, contentsString, opts, cumulativeLines);
                var found = findModules(entryMod, requireAs, opts, [], modulesCache, cumulativeLines);
                found.requireAs = requireAs;
                entryMod.relMap = found.relMap;
                var packed = packModules(found, entryMod, opts);

                if (packed.insertExtraLines) {
                    r.sourcemaps.forEach(function (smap) {
                        smap.generated.line += packed.insertExtraLines;
                    });
                }

                each(found.modules, function (mod, modPath) {

                    // map dependency to Bundl
                    if (_this.isBundl) {
                        _this.mapDependency.call(_this, r.name, modPath);
                    }
                    // add sourcemap to resource
                    r.sourcemaps.push(mod.sourcemap);

                });

                // replace contents with our packaged code
                r.contents.set(packed.code);
            }
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

function create(contents, options) {
    var _contents = contents;
    var r = {
        contents: {
            getString: function () {
                return _contents;
            },
            set: function (newContents) {
                _contents = newContents;
            },
        },
        sourcemaps: [],
    };
    bundlPack(options).exec(r);
    return r.contents.getString();
}

bundlPack.create = create;
bundlPack.requirer = requirer;

module.exports = bundlPack;
