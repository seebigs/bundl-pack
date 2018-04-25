var detective = require('detective');
var getProcessor = require('./processors/_get.js');
var path = require('path');
var resolve = require('./resolve.js');
var each = require('seebigs-each');

var modulesCache = {};
var cumulativeLines = 0;
var innerWrapperHeight = 6;

function mockDetective (contents) {
    var matchMock = /require\.cache\.mock\(['"]([\w\.\/-]+)/g;
    matchMock = matchMock.exec(contents);
    return matchMock ? matchMock[1] : [];
}

function processFile(file, options, _isEntry) {
    var filepath = file.path;
    var contents = file.contents;
    var ext = _isEntry ? 'js' : path.extname(filepath).substr(1);
    var filename = filepath.split('/').pop();

    var procOptions = options[ext] || {};
    var p = {};
    var requireAs;

    try {
        if (typeof procOptions === 'function') {
            p = procOptions(getProcessor, {}, options);
            procOptions = {};
        } else if (typeof procOptions.processor === 'function') {
            var customProcessor = procOptions.processor;
            delete procOptions.processor;
            p = customProcessor(getProcessor, procOptions, options);
        } else if (ext !== 'js' && file.processAs !== 'js') {
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
    file.sourcemap = {
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

function findAllModules(file, requireAs, options, history, _initialLines) {
    var _isEntry = !history.length;
    var filepath = _isEntry ? file.path : path.resolve(file.path);
    history.push(filepath);
    var relMap = {};
    var modules = {};

    cumulativeLines += innerWrapperHeight;

    // find unique require statements in this file
    var reqs = [].concat(detective(file.contents), mockDetective(file.contents));
    reqs = reqs.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    // resolve each require string and add to collection
    each(reqs, function (req) {
        var subfile = resolve(req, filepath, options.paths);
        var subfilePath = subfile.path;
        if (history.indexOf(subfilePath) === -1) {
            if (subfile.contents) {
                var subModules = {};
                if (modulesCache[subfilePath]) {
                    subModules = modulesCache[subfilePath];
                    each(subModules.requireAs, function (reqAs, reqExt) {
                        var processOptions = options[reqExt] || {};
                        if (processOptions.autoInject !== false) {
                            requireAs[reqExt] = reqAs;
                        }
                    });
                } else {
                    var procSub = processFile(subfile, options);
                    subfile.contents = procSub.contents;
                    if (procSub.requireAs) {
                        requireAs[procSub.ext] = procSub.requireAs;
                    }
                    subModules = findAllModules(subfile, requireAs, options, history);
                    modulesCache[subfilePath] = subModules;
                    history.pop();
                }
                Object.assign(modules, subModules.modules);
                subfile.relMap = subModules.relMap;
                relMap[req] = subfilePath;

            } else {
                var missingModule = 'Module "' + req + '" not found from ' + filepath;
                if (options.paths) {
                    missingModule += '   with paths: ' + options.paths;
                }
                throw new Error(missingModule);
                // console.log('Module "' + req + '" not found from ' + filepath);
                // if (options.paths) {
                //     console.log('   with paths: ' + options.paths);
                // }
            }

        } else {
            console.log('Module "' + req + '" is circular from ' + filepath);
            console.log(history);
            console.log();
        }
    });

    if (filepath !== '#entry') {
        modules[filepath] = file;
    }

    return {
        modules,
        relMap,
        requireAs,
    };
}

function findModules(entryFile, options, initialLines) {
    cumulativeLines = initialLines;
    var procEntry = processFile(entryFile, options, true);
    entryFile.contents = procEntry.contents;
    var requireAs = {};
    var found = findAllModules(entryFile, requireAs, options, [], initialLines);
    found.requireAs = requireAs;
    return found;
}

module.exports = findModules;
