/**
 * Bundl plugin to package 'required' dependencies
 */

var findDeps = require('./lib/find');
var packModules = require('./lib/pack');
var requirer = require('./lib/pack/requirer');

function bundlPack(opts) {
    var options = Object.assign({}, opts);

    var cache = {
        modules: {},
        requireAs: {},
    };

    /**
     * @param {Object} r the resource object being processed
     *   (must contain r.contents)
     */
    function exec(r, done) {
        var _this = this;

        // map a dependency for Bundl
        function mapDependency(modPath) {
            if (_this.isBundl) {
                _this.mapDependency.call(_this, r.name, modPath);
            }
        }

        // flush cached contents if the resource has changed
        if (r.changed) {
            cache.modules = {};
            cache.requireAs = {};
        }

        if (r.contents) {
            var contentsString = r.contents.getString();
            if (contentsString) {
                var entryPath = (r.src || [])[0] || '#entry';
                var cumulativeLines = (_this.isBundl ? _this.LINES || 1 : 1) + 5;
                var store = {
                    history: [],
                    modules: cache.modules,
                    requireAs: cache.requireAs,
                };

                findDeps(store, contentsString, entryPath, options, function () {
                    var packed = packModules(store, mapDependency, cumulativeLines, options);
                    r.sourcemaps = packed.sourcemaps;
                    r.contents.set(packed.code);
                    done();
                });
            }
        }
    }

    return {
        name: 'pack',
        stage: 'stringy',
        ext: ['js'],
        exec: exec,
    };

}

function create(contents, options, callback) {
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
    bundlPack(options).exec(r, function () {
        if (typeof callback === 'function') {
            callback(r.contents.getString(), r.sourcemaps);
        }
    });
}

bundlPack.create = create;
bundlPack.requirer = requirer;

module.exports = bundlPack;
