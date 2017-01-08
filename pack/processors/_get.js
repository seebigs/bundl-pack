/**
 * Use the appropriate preprocessor for a given file extension
 */

module.exports = {
    css: require('./css.js'),
    html: require('./html.js'),
    json: require('./json.js')
};
