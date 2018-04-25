var path = require('path');

function constructEntryFile (r, contentsString) {
    var concatenatedEntryName = '#entry';
    var srcArr = r.src || [];

    var entryFile = {
        id: 0,
        contents: contentsString,
    };

    if (srcArr.length === 1 && typeof srcArr[0] === 'string') {
        entryFile.path = srcArr[0];
        entryFile.base = path.dirname(entryFile.path);

    } else {
        entryFile.path = concatenatedEntryName;
    }

    return entryFile;
}

module.exports = constructEntryFile;
