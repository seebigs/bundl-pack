var getBuiltinProcessor = require('./processors/_get.js');

function processModule(mod, options, requireAs, done) {

    function getProcessor(extension, options) {
        options = options || {};
        var proc = options[extension] || {};

        var preProcessor = {};
        if (typeof proc === 'function') {
            preProcessor = proc(getProcessor, {}, options);
            proc = {};
        } else if (typeof proc.processor === 'function') {
            var customProcessor = proc.processor;
            var customOptions = Object.assign({}, proc);
            delete customOptions.processor;
            preProcessor = customProcessor(getProcessor, customOptions, options);
        } else {
            preProcessor = getBuiltinProcessor(extension);
        }

        if (preProcessor.requireAs && proc.autoInject !== false) {
            requireAs[extension] = preProcessor.requireAs;
        }

        return {
            options: proc,
            processor: preProcessor.processor,
        }
    }

    function setContents(processedContents) {
        if (!mod.processed) {
            mod.contents = String(processedContents);
            mod.processed = true;
            done();
        }
    }

    try {
        var processor = getProcessor(mod.ext, options);
        if (typeof processor.processor === 'function') {
            var file = {
                contents: mod.contents,
                ext: mod.ext,
                path: mod.path,
                filename: mod.name,
            };
            var processedContents = processor.processor(file, processor.options, setContents);
            if (processedContents) {
                setContents(processedContents);
            }
        }

    } catch (err) {
        console.log('Error in ' + mod.ext + ' preprocessor');
        console.log(err.stack);
        if (options.exitProcessOnError !== false) {
            process.exit(1);
        }
    }
}

module.exports = processModule;
