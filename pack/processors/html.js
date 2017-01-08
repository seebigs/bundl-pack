/**
 * Preprocessor for `.html` files
 */

var htmlMinifier = require('html-minifier');
var utils = require('./_utils.js');

function minHTML (file, options) {
    options = Object.assign({
        collapseWhitespace: true,
        removeComments: true
    }, options);

    if (options === false) {
        return file.contents;
    }

    return htmlMinifier.minify(file.contents, options);
}

function htmlProcessor (file, options) {
    options = options || {};

    var contents = file.contents;

    // collapse into one line
    contents = minHTML(file, options.minify);

    // escape single quotes
    contents = utils.escapeSingleQuotes(contents);

    // write to export
    contents = "module.exports = '" + contents + "';";

    return contents;
}

module.exports = {

    processor: htmlProcessor

};
