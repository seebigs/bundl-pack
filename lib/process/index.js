var getBuiltinProcessor = require('./processors/_get.js');
var path = require('path');

function getProcessor(extension, options) {
    options = options || {};
    var opts = options[extension] || {};

    var preProcessor = {};
    if (typeof opts === 'function') {
        preProcessor = opts(getProcessor, {}, options);
        opts = {};
    } else if (typeof opts.processor === 'function') {
        var customProcessor = opts.processor;
        var customOptions = Object.assign({}, opts);
        delete customOptions.processor;
        preProcessor = customProcessor(getProcessor, customOptions, options);
    } else if (extension !== 'js') {
        preProcessor = getBuiltinProcessor(extension);
    } else {
        preProcessor = {
            processor: function (file) {
                return file.contents;
            }
        };
    }

    return {
        options: opts,
        processor: preProcessor.processor,
        requireAs: preProcessor.requireAs,
    }
}

function processModule(mod, options, cumulativeLines, _isEntry) {
    var filepath = mod.path;
    var contents = mod.contents;
    var ext = _isEntry ? 'js' : (mod.processAs || path.extname(filepath).substr(1));
    var filename = filepath.split('/').pop();

    try {
        var processor = getProcessor(ext, options);
        if (typeof processor.processor === 'function') {
            contents = processor.processor({
                contents: contents,
                ext: ext,
                path: filepath,
                filename: filename
            }, processor.options) + '\n';
        }

    } catch (err) {
        console.log('Error in ' + ext + ' preprocessor');
        console.log(err.stack);
        if (options.exitProcessOnError !== false) {
            process.exit(1);
        }
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
        requireAs: processor.requireAs,
    };
}

module.exports = processModule;
