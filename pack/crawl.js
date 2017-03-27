var detective = require('detective');
var getProcessor = require('./processors/_get.js');
var path = require('path');
var resolve = require('./resolve.js');
var utils = require('seebigs-utils');

var args = utils.args();

var cumulativeLines = 0;
var innerWrapperHeight = 6;

function mockDetective (contents) {
    var matchMock = /require\.cache\.mock\(['"]([\w\.\/-]+)/g;
    matchMock = matchMock.exec(contents);
    return matchMock ? matchMock[1] : [];
}

function crawl (options, file, pack, requireAs, isEntry, initialLines) {
    var filepath = isEntry ? file.path : path.resolve(file.path);
    var contents = file.contents.toString();
    var ext = path.extname(filepath).substr(1);
    var filename = filepath.split('/').pop();
    var relMap = {};

    if (isEntry) {
        cumulativeLines = initialLines;
    } else {
        cumulativeLines += innerWrapperHeight;
    }

    // run processors
    var fileObj = {
        contents: contents,
        ext: ext,
        path: filepath,
        filename: filename
    };

    var procOptions = (isEntry ? (options.entry || options.js) : options[ext]) || {};
    var p = {};

    try {
        if (typeof procOptions === 'function') {
            p = procOptions(getProcessor, options);
            procOptions = {};
        } else if (!isEntry && ext !== 'js' && file.processAs !== 'js') {
            p = getProcessor(ext);
        }

        if (typeof p.processor === 'function') {
            contents = p.processor(fileObj, procOptions) + '\n';
        }

        if (p.requireAs && procOptions.autoInject !== false) {
            requireAs[ext] = p.requireAs;
        }

    } catch (err) {
        console.log('Error in ' + ext + ' preprocessor');
        console.log(err.stack);
        process.exit(1);
    }

    var numLines = contents.split(/\r\n|\r|\n/).length;

    pack[filepath] = {
        id: Object.keys(pack).length,
        path: filepath,
        contents: contents,
        sourcemap: {
            source: filepath,
            original: { line: 1, column: 0 },
            generated: { line: cumulativeLines, column: 0 },
            totalLines: numLines
        }
    };

    if (!isEntry) {
        cumulativeLines += numLines;
    }

    // find require statements in this file
    var reqs = [].concat(detective(contents), mockDetective(contents));

    reqs = reqs.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    utils.each(reqs, function (req) {

        var mod = resolve(req, filepath, options.paths);

        if (mod.contents) {
            if (!pack[mod.path]) {
                var subfile = {
                    base: path.dirname(mod.path),
                    contents: mod.contents,
                    id: req,
                    path: mod.path,
                    processAs: mod.processAs
                };

                Object.assign(pack, crawl(options, subfile, pack, requireAs));
            }

            relMap[req] = mod.path;

        } else {
            console.log();
            console.log('Module "' + req + '" not found from ' + filepath);
            if (options.paths) {
                console.log('   with paths: ' + options.paths);
            }
        }

    });

    pack[filepath].relMap = relMap;

    return pack;
}

module.exports = crawl;
