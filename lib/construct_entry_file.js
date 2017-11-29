var path = require('path');

function constructEntryFile (r) {
    var concatenatedEntryName = '#entry';
    var srcArr = r.src || [];

    var entryFile = {
        contents: r.contents.tree.generate(),
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
