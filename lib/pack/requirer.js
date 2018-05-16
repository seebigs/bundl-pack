function require (modules, as) {
    var cache = {};
    var mocks = {};

    function __require_lookup (id) {
        function __require_in_module (relpath) {
            var packedId = modules[id][1][relpath];
            if (!packedId) throw new Error('Missing ' + relpath);
            return mocks[packedId] || __require_lookup(packedId);
        }

        __require_in_module.as = as;

        function _bundl_mock (relpath, mock) {
            var packedId = modules[id][1][relpath];
            mocks[packedId] = mock;
        }

        _bundl_mock.stopAll = function () {
            cache = {};
            mocks = {};
        };

        __require_in_module.cache = {
            mock: _bundl_mock,
            clear: function () {
                cache = {};
            }
        };

        if(!cache[id]) {
            var m = cache[id] = {exports:{}};
            modules[id][0].call(m.exports, __require_in_module, m, m.exports, modules);
        }

        return cache[id] ? cache[id].exports : {};
    }

    __require_lookup(0);
}

module.exports = require;
