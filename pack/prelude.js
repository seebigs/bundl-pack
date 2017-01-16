
function _bundl (modules, as) {
    var cache = {};

    function _bundl_require (id) {
        if(!cache[id]) {
            var m = cache[id] = {exports:{}};

            function _bundl_require_in_module (relpath) {
                var packedId = modules[id][1][relpath];
                if (!packedId) throw 'Missing ' + relpath;
                return _bundl_require(packedId);
            }

            _bundl_require_in_module.as = as;

            modules[id][0].call(m.exports, _bundl_require_in_module, m, m.exports, modules);
        }

        return cache[id].exports;
    }

    _bundl_require(0);
}

module.exports = _bundl;
