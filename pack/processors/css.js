/**
 * Preprocessor for `.css` files
 */

var CleanCSS = require('clean-css');
var utils = require('./_utils.js');

function minCSS (file, options) {
    if (options === false) {
        return file.contents;
    }

    return new CleanCSS(options).minify(file.contents).styles;
}

function cssProcessor (file, options, requireAsExt) {
    options = options || {};

    var contents = file.contents;

    // collapse into one line
    contents = minCSS(file, options.minify);

    // escape single quotes
    contents = utils.escapeSingleQuotes(contents);

    // write to export
    if (options.autoInject === false) {
        contents = "module.exports = '" + contents + "';";
    } else {
        var className = file.path ? "', '" + file.path.split('/').pop() : '';
        contents = "module.exports = require.as." + (requireAsExt || 'css') + "('" + contents + className + "');";
    }

    return contents;
}

function requireAs (cssText, className) {
    if (cssText) {
        var doc = document;
        var t = doc.getElementsByTagName('head')[0] || doc.getElementsByTagName('body')[0];
        var el = doc.createElement('style');
        el.type = 'text/css';
        if (className) { el.className = 'injectedBy.' + className; }
        t.appendChild(el);
        if (el.styleSheet) {
            el.styleSheet.cssText = cssText; // IE
        } else {
            try {
                el.innerHTML = cssText; // Non-IE
            } catch (e) {
                el.innerText = cssText; // Safari (OS specific)
            }
        }
    }
    return cssText;
}

module.exports = {
    processor: cssProcessor,
    requireAs: requireAs
};
