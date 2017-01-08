
function prelude (modules, as) {
    var cache = {};

    function bundlRequire (id) {
        if(!cache[id]) {
            var m = cache[id] = {exports:{}};

            var inModuleRequire = function (relpath) {
                var packedId = modules[id][1][relpath];
                if (!packedId) throw 'Missing ' + relpath;
                return bundlRequire(packedId);
            };

            inModuleRequire.as = as;

            modules[id][0].call(m.exports, inModuleRequire, m, m.exports, modules);
        }

        return cache[id].exports;
    }

    bundlRequire(0);
}

module.exports = prelude;
