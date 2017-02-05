var detective = require('detective');
var getProcessor = require('./processors/_get.js');
var path = require('path');
var resolve = require('./resolve.js');
var utils = require('seebigs-utils');

var args = utils.args();

function mockDetective (contents) {
    var matchMock = /require\.cache\.mock\(['"]([\w\.\/-]+)/g;
    matchMock = matchMock.exec(contents);
    return matchMock ? matchMock[1] : [];
}

function crawl (options, file, pack, requireAs, isEntry) {
    var filepath = isEntry ? file.path : path.resolve(file.path);
    var contents = file.contents.toString();
    var ext = path.extname(filepath).substr(1);
    var filename = filepath.split('/').pop();
    var relMap = {};

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
        } else if (!isEntry && ext !== 'js') {
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

    pack[filepath] = {
        id: Object.keys(pack).length,
        path: filepath,
        contents: contents
    };

    // find require statements in this file
    var reqs = [].concat(detective(contents), mockDetective(contents));

    reqs = reqs.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    var resolvePath = isEntry ? path.resolve('.') : filepath;
    utils.each(reqs, function (req) {
        var mod = resolve(req, resolvePath, options.paths);

        if (mod.contents) {
            if (!pack[mod.path]) {
                if (args.verbose) {
                    console.log('- Required ' + mod.path);
                }

                var subfile = {
                    base: path.dirname(mod.path),
                    contents: mod.contents,
                    id: req,
                    path: mod.path
                };

                Object.assign(pack, crawl(options, subfile, pack, requireAs));
            }

            relMap[req] = mod.path;

        } else {
            console.log();
            console.log('Module "' + req + '" not found from ' + resolvePath);
            if (options.paths) {
                console.log('   with paths: ' + options.paths);
            }
        }

    });

    pack[filepath].relMap = relMap;

    return pack;
}

module.exports = crawl;
