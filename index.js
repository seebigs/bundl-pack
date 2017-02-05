/**
 * Bundl plugin to package 'required' dependencies
 */

var pack = require('./pack');
var requirer = require('./pack/requirer');
var utils = require('seebigs-utils');

function bundlPack (options) {
    var opts = Object.assign({}, options);

    /**
     * @param {String} contents the initial contents of the file being processed
     * @option {Object} r the resource object being processed
     * @returns { changemap, contents (updated) }
     */
    function one (contents, r) {
        r = r || { contents: contents };
        return pack(r, opts);
    }

    return {
        one: one
    };

}

bundlPack.requirer = requirer;

module.exports = bundlPack;
