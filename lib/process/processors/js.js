/**
 * Preprocessor for `.js` files
 */

function jsProcessor(file) {
    return file.contents;
}

module.exports = {
    processor: jsProcessor
};
