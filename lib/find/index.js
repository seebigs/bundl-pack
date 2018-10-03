var detective = require('detective');
var path = require('path');
var processModule = require('../process');
var resolve = require('./resolve.js');
var each = require('seebigs-each');

var innerWrapperHeight = 6;

function mockDetective (contents) {
    var matchMock = /require\.cache\.mock\(['"]([\w./-]+)/g;
    matchMock = matchMock.exec(contents);
    return matchMock ? matchMock[1] : [];
}

function shouldIncludeRequireAs(options, ext) {
    return (options[ext] || {}).autoInject !== false;
}

function findModules(file, requireAs, options, history, modulesCache, cumulativeLines) {
    var _isEntry = !history.length;
    var filepath = _isEntry ? file.path : path.resolve(file.path);
    history.push(filepath);
    var relMap = {};
    var modules = {};

    cumulativeLines += innerWrapperHeight;

    // find unique require statements in this file
    try {
        var reqs = [].concat(detective(file.contents), mockDetective(file.contents));
        reqs = reqs.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    } catch (err) {
        var errStack = err.stack;
        var unexpectedToken = 'Unexpected token';
        if (err.message.indexOf(unexpectedToken) === 0) {
            var token = ' `' + file.contents.substr(err.pos, 1) + '`';
            var loc = err.loc || { line: '', column: '' };
            var errPath = '\n    at ' + filepath + ':' + loc.line + ':' + loc.column;
            errStack = new SyntaxError(unexpectedToken + token + errPath).stack;
        }
        console.log('Error finding dependencies in' + filepath);
        console.log(errStack);
        if (options.exitProcessOnError !== false) {
            process.exit(1);
        }
    }

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
                        if (shouldIncludeRequireAs(options, reqExt)) {
                            requireAs[reqExt] = reqAs;
                        }
                    });
                } else {
                    var procSub = processModule(subfile, options, cumulativeLines);
                    subfile.contents = procSub.contents;
                    if (procSub.requireAs && shouldIncludeRequireAs(options, procSub.ext)) {
                        requireAs[procSub.ext] = procSub.requireAs;
                    }
                    subModules = findModules(subfile, requireAs, options, history, modulesCache, cumulativeLines);
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
            }

        } else {
            console.log('\nModule "' + req + '" is circular from ' + filepath);
            console.log(history);
            console.log();
            if (!options.allowCircular) {
                throw new Error('Circular dependency references are not allowed');
            }
        }
    });

    // try a simple parse to get module name from the first characters of the content
    try {
        var match = file.contents.substr(0, 500).match(/@module (\w+)/);
        if (match && match[1]) {
            file.name = match[1];
        }
    } catch (err) {
        // do nothing
    }

    if (filepath !== '#entry') {
        modules[filepath] = file;
    }

    return {
        modules,
        relMap,
        requireAs,
    };
}

module.exports = findModules;
