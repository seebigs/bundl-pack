var getProcessor = require('./processors/_get.js');
var path = require('path');

function processModule(mod, options, cumulativeLines, _isEntry) {
    var filepath = mod.path;
    var contents = mod.contents;
    var ext = _isEntry ? 'js' : path.extname(filepath).substr(1);
    var filename = filepath.split('/').pop();

    var procOptions = options[ext] || {};
    var p = {};

    try {
        if (typeof procOptions === 'function') {
            p = procOptions(getProcessor, {}, options);
            procOptions = {};
        } else if (typeof procOptions.processor === 'function') {
            var customProcessor = procOptions.processor;
            var customOptions = Object.assign({}, procOptions);
            delete customOptions.processor;
            p = customProcessor(getProcessor, customOptions, options);
        } else if (ext !== 'js' && mod.processAs !== 'js') {
            p = getProcessor(ext);
        }

        if (typeof p.processor === 'function') {
            contents = p.processor({
                contents: contents,
                ext: ext,
                path: filepath,
                filename: filename
            }, procOptions) + '\n';
        }

    } catch (err) {
        console.log('Error in ' + ext + ' preprocessor');
        console.log(err.stack);
        process.exit(1);
    }

    var numLines = contents.split(/\r\n|\r|\n/).length;
    mod.sourcemap = {
        source: filepath,
        original: { line: 1, column: 0 },
        generated: { line: cumulativeLines, column: 0 },
        totalLines: numLines,
    };
    cumulativeLines += numLines;

    return {
        contents,
        ext,
        requireAs: p.requireAs,
    };
}

module.exports = processModule;
