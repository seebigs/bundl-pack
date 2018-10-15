/**
 * Preprocessor for `.json` files
 */

var utils = require('./_utils.js');

function minJSON(file, options) {
    try {
        return JSON.stringify(JSON.parse(file.contents), null, options.space || null);
    } catch (e) {
        console.log('Invalid JSON: ' + file.path + ' could not be parsed.');
        throw(e);
    }
}

function jsonProcessor(file, options) {
    options = options || {};

    var contents = file.contents;

    // collapse into one line
    contents = minJSON(file, options);

    // escape single quotes
    contents = utils.escapeSingleQuotes(contents);

    // write to export
    if (options.autoInject === false) {
        contents = "module.exports = '" + contents + "';";
    } else {
        contents = "module.exports = require.as.json('" + contents + "', '" + file.filename + "');";
    }

    return contents + '\n';
}

function requireAs(str) {
    return JSON.parse(str);
}

module.exports = {
    processor: jsonProcessor,
    requireAs: requireAs
};
