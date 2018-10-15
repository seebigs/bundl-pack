require.cache.mock('./sub/two.js', function(){ return { mocked: true }; });
var a = require('./one.js');
require.cache.mock.stopAll();
var b = require('./one.js');

window.testValue = Object.keys(a.two) + ',' + Object.keys(b.two);
