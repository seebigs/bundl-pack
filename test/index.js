
var FeatherTest = require('feather-test');

var myTest = new FeatherTest({
    specs: [
        './specs/pack.commonjs.spec.js',
        './specs/standalone.spec.js',
    ],
});

myTest.run();
