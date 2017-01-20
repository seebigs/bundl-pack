
function _bundl (modules, as) {
    var cache = {};
    var mocks = {};

    function _bundl_require (id) {
        if(!cache[id]) {
            var m = cache[id] = {exports:{}};

            function _bundl_in_module (relpath) {
                var packedId = modules[id][1][relpath];
                if (!packedId) throw 'Missing ' + relpath;
                return mocks[packedId] || _bundl_require(packedId);
            }

            _bundl_in_module.as = as;

            function _bundl_mock (relpath, mock) {
                var packedId = modules[id][1][relpath];
                mocks[packedId] = mock;
            }

            _bundl_mock.stopAll = function () {
                cache = {};
                mocks = {};
            };

            _bundl_in_module.cache = {
                mock: _bundl_mock
            };

            modules[id][0].call(m.exports, _bundl_in_module, m, m.exports, modules);
        }

        return cache[id] ? cache[id].exports : {};
    }

    _bundl_require(0);
}

module.exports = _bundl;
