
var FeatherTest = require('feather-test');
var utils = require('seebigs-utils');

var myTest = new FeatherTest({
    specs: './specs/shims.spec.js',
});

myTest.run(function (err) {
    if (!err) {
        console.log();
        utils.each(window.testValues, function (val, shimName) {
            console.log('   ' + shimName);
        });
    }
});
