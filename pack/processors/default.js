/**
 * Preprocessor for all other files
 */

var utils = require('./_utils.js');

function defaultProcessor (file, options) {
    var contents = file.contents;

    // collapse into one line
    contents = contents.replace(new RegExp('[\n\r\t]+ *', 'g'), '');

    // escape single quotes
    contents = utils.escapeSingleQuotes(contents);

    // write to export
    contents = "module.exports = '" + contents + "';";

    return contents;
}

module.exports = {
    processor: defaultProcessor
};
