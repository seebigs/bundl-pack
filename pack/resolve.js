/**
 * Resolve a module path into a packable module
 */

var fs = require('fs');
var path = require('path');
var seebigsResolve = require('seebigs-resolve').browser;

// Shims for packages that are included with bundl-pack
var builtins = {
    'buffer': path.resolve(__dirname + '/../shims/buffer.js'),
    'crypto': require.resolve('crypto-browserify'),
    'fetch': path.resolve(__dirname + '/../shims/fetch.js'),
    'http': path.resolve(__dirname + '/../shims/http.js'),
    'https': path.resolve(__dirname + '/../shims/https.js'),
    'indexof': path.resolve(__dirname + '/../shims/indexof.js'),
    'os': require.resolve('os-browserify/browser.js'),
    'path': require.resolve('path-browserify'),
    'process': path.resolve(__dirname + '/../shims/process.js'),
    'request': path.resolve(__dirname + '/../shims/request.js'),
    'stream': require.resolve('stream-browserify'),
    'string_decoder': require.resolve('string_decoder/'),
    'url': path.resolve(__dirname + '/../shims/url.js'),
    'util': path.resolve(__dirname + '/../shims/util.js'),
    'vm': require.resolve('vm-browserify')
};

// Shims for packages that must be npm installed into YOUR project
var externals = {
    // 'thing': 'thing-browserify'
};

function resolve (str, fromFile, paths) {
    var builtin = builtins[str];
    if (builtin) {
        return {
            contents: fs.readFileSync(builtin, 'utf8'),
            path: builtin
        };
    }

    var external = externals[str];
    if (external) {
        if (!seebigsResolve(external, process.cwd()).contents) {
            throw new Error('The "' + str + '" module needs a browser shim. Please run `npm install --save-dev ' + external + '`');
        }

        return {
            contents: 'module.exports = require("' + external + '");',
            path: path.resolve('node_modules/' + str),
            processAs: 'js'
        };
    }

    return seebigsResolve.apply(this, arguments);
}

module.exports = resolve;
