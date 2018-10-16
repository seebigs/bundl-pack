function countLines(str) {
    return str.split(/\r\n|\r|\n/).length;
}

function create(mod, cumulativeLines) {
    if (typeof mod.contents !== 'string') { console.log(mod); }
    var numLines = countLines(mod.contents);
    return {
        source: mod.path,
        original: { line: 1, column: 0 },
        generated: { line: cumulativeLines, column: 0 },
        totalLines: numLines,
    };
}

module.exports = {
    countLines: countLines,
    create: create
};
