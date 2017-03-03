
var featherTest = require('feather-test');
var utils = require('seebigs-utils');

featherTest.queue('./specs/shims.spec.js');

featherTest.run(function (err) {
    if (!err) {
        console.log();
        utils.each(window.testValues, function (val, shimName) {
            console.log('   ' + shimName);
        });
    }
});
