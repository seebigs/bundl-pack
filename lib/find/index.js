var detective = require('detective');
var each = require('seebigs-each');
var path = require('path');
var processModule = require('../process');
var resolve = require('./resolve.js');

function mockDetective (contents) {
    var matchMock = /require\.cache\.mock\(['"]([\w./-]+)/g;
    matchMock = matchMock.exec(contents);
    return matchMock ? matchMock[1] : [];
}

function findDeps(store, contents, absPath, options, callback) {
    var relMap = {};
    store.history.push(absPath);
    var mod = store.modules[absPath];
    if (mod) {
        depsFound();
    } else {
        mod = {
            path: absPath,
            name: absPath.split('/').pop(),
            ext: path.extname(absPath).substr(1) || 'js',
            relMap,
            contents,
            processed: false,
        };
        processModule(mod, options, store.requireAs, function () {
            // find unique require statements in this file
            try {
                var imports = [].concat(detective(mod.contents), mockDetective(mod.contents));
                imports = imports.filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
            } catch (err) {
                var errStack = err.stack;
                var unexpectedToken = 'Unexpected token';
                if (err.message.indexOf(unexpectedToken) === 0) {
                    var token = ' `' + mod.contents.substr(err.pos, 1) + '`';
                    var loc = err.loc || { line: '', column: '' };
                    var errPath = '\n    at ' + absPath + ':' + loc.line + ':' + loc.column;
                    errStack = new SyntaxError(unexpectedToken + token + errPath).stack;
                }
                console.log('Error finding dependencies in' + absPath);
                console.log(errStack);
                if (options.exitProcessOnError !== false) {
                    process.exit(1);
                }
            }

            each(imports, function (relPath) {
                var subfile = resolve(relPath, absPath);
                var subfilePath = subfile.path;
                var subfileContents = subfile.contents;

                if (subfilePath) {
                    if (store.history.indexOf(subfilePath) === -1) {
                        relMap[relPath] = subfilePath;
                        findDeps(store, subfileContents, subfilePath, options, callback);

                    } else {
                        console.log('\nModule "' + relPath + '" is circular from ' + absPath);
                        console.log(store.history);
                        console.log();
                        if (!options.allowCircular) {
                            throw new Error('Circular dependency references are not allowed');
                        }
                    }

                } else {
                    var missingModule = 'Module "' + relPath + '" not found from ' + absPath;
                    if (options.paths) {
                        missingModule += '   with paths: ' + options.paths;
                    }
                    throw new Error(missingModule);
                }
            });

            // Find the module tagname if a comment block exists with an @module tag
            //    try a simple match from the first characters of the content
            try {
                var match = mod.contents.substr(0, 500).match(/\*\s*@module (\w+)/);
                if (match && match[1]) {
                    mod.tagname = match[1];
                }
            } catch (err) {
                // tagname not found, do nothing
            }

            if (!store.modules[absPath]) {
                store.modules[absPath] = mod;
            }

            depsFound();
        });
    }

    function depsFound() {
        store.history.pop();
        if (store.history.length === 0) {
            callback();
        }
    }
}

module.exports = findDeps;
