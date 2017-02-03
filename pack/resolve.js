
var path = require('path');
var seebigsResolve = require('seebigs-resolve');

// Override requires for the following
var override = {

    // Built-in node modules that can be used in browsers

    'path': "require('path-browserify')",

    'url': "window.URL",

    // Shims for external node_modules that should work in browsers

};

function resolve (str, fromFile, paths) {
    var ovr = override[str];
    if (ovr) {
        return {
            contents: 'module.exports = ' + ovr.toString() + ';',
            path: path.resolve('node_modules/' + str)
        };
    }

    return seebigsResolve.apply(this, arguments);
}

module.exports = resolve;
