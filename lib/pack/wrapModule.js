var each = require('seebigs-each');

function escapeRegExp(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Wrap the module contents to be included in the pack
 *   Don't modify the original `mod` object
 *   Don't add any new lines
 */
function wrapModule(mod, modules, options) {
    var leadingComment = options.leadingComments === false ? '\n\n' : '/*** [' + (mod.id) + '] ' + mod.path + ' ***/\n\n';
    var modName = options.obscure ? '' : (mod.tagname ? ',' + "'" + mod.tagname + "'" : '');
    var modOpener = '[(function (require, module, exports) {\n';
    var modCloser = '\n\n}),';
    var modContents = mod.contents;
    var relMap = {};
    each(mod.relMap, function (abs, rel) {
        var m = modules[abs];
        var coord = m ? m.id : 0;
        if (options.obscure) {
            var matchReq = new RegExp('require\\([\\\'\\"]' + escapeRegExp(rel) + '[\\\'\\"]\\)', 'g');
            modContents = modContents.replace(matchReq, 'require(' + coord + ')');
            relMap[coord] = coord;
        } else {
            relMap[rel] = coord;
        }
    });

    var modStr = modOpener + leadingComment + modContents + modCloser;
    modStr += JSON.stringify(relMap);
    modStr += modName;
    return modStr + '],\n';
}

module.exports = wrapModule;
