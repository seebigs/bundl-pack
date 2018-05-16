var path = require('path');
var processModule = require('../process');

function getEntryModule(r, contentsString, options, cumulativeLines) {
    var concatenatedEntryName = '#entry';
    var srcArr = r.src || [];

    var entryMod = {
        id: 0,
        contents: contentsString,
    };

    if (srcArr.length === 1 && typeof srcArr[0] === 'string') {
        entryMod.path = srcArr[0];
        entryMod.base = path.dirname(entryMod.path);

    } else {
        entryMod.path = concatenatedEntryName;
    }

    entryMod.contents = processModule(entryMod, options, cumulativeLines, true).contents;

    return entryMod;
}

module.exports = getEntryModule;
