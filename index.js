/**
 * Bundl plugin to package 'required' dependencies
 */

var pack = require('./pack');
var utils = require('seebigs-utils');


module.exports = function (options) {
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

};
