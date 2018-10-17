/**
 * Get the built-in preprocessor for a given file extension
 */

var defaultProcessor = require('./default.js');
var byExtension = {
    css: require('./css.js'),
    html: require('./html.js'),
    js: require('./js.js'),
    json: require('./json.js')
};

module.exports = function get (ext) {
    return byExtension[ext] || defaultProcessor;
};
