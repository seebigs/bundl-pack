/**
 * Use the appropriate preprocessor for a given file extension
 */

var defaultProcessor = require('./default.js');
var byExtension = {
    css: require('./css.js'),
    html: require('./html.js'),
    json: require('./json.js')
};

module.exports = function get (ext) {
    return byExtension[ext] || defaultProcessor;
};
