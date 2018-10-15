var nodeAsBrowser = require('node-as-browser');
nodeAsBrowser.init(global);

var each = require('seebigs-each');
var FeatherTest = require('feather-test');

var myTest = new FeatherTest({
    specs: './specs/shims.spec.js',
});

myTest.run(function (err) {
    if (!err) {
        console.log();
        each(window.testValues, function (val, shimName) {
            console.log('   ' + shimName);
        });
    }
});
