// var detective = require('detective');
// var getProcessor = require('./processors/_get.js');
// var path = require('path');
// var resolve = require('./resolve.js');
// var utils = require('seebigs-utils');
//
// var modulesCache = {};
// var cumulativeLines = 0;
// var innerWrapperHeight = 6;
//
// function mockDetective (contents) {
//     var matchMock = /require\.cache\.mock\(['"]([\w\.\/-]+)/g;
//     matchMock = matchMock.exec(contents);
//     return matchMock ? matchMock[1] : [];
// }
//
// function processFile(file, filepath, options, _isEntry) {
//     console.log('processFile', filepath);
//     var contents = file.contents;
//     var ext = path.extname(filepath).substr(1);
//     var filename = filepath.split('/').pop();
//     var requireAs = {};
//
//     var procOptions = (_isEntry ? (options.entry || options.js) : options[ext]) || {};
//     var p = {};
//
//     try {
//         if (typeof procOptions === 'function') {
//             p = procOptions(getProcessor, options);
//             procOptions = {};
//         } else if (!_isEntry && ext !== 'js' && file.processAs !== 'js') {
//             p = getProcessor(ext);
//         }
//
//         if (typeof p.processor === 'function') {
//             contents = p.processor({
//                 contents: contents,
//                 ext: ext,
//                 path: filepath,
//                 filename: filename
//             }, procOptions) + '\n';
//         }
//
//         if (p.requireAs && procOptions.autoInject !== false) {
//             requireAs[ext] = p.requireAs;
//         }
//
//     } catch (err) {
//         console.log('Error in ' + ext + ' preprocessor');
//         console.log(err.stack);
//         process.exit(1);
//     }
//
//     var numLines = contents.split(/\r\n|\r|\n/).length;
//     file.sourcemap = {
//         source: filepath,
//         original: { line: 1, column: 0 },
//         generated: { line: cumulativeLines, column: 0 },
//         totalLines: numLines,
//     };
//     cumulativeLines += numLines;
//
//     return {
//         contents,
//         requireAs,
//     };
// }
//
// function findAllModules(file, options, history, _initialLines) {
//     var _isEntry = !history.length;
//     var filepath = _isEntry ? file.path : path.resolve(file.path);
//     history.push(filepath);
//     var proc = processFile(file, filepath, options, _isEntry);
//     file.contents = proc.contents;
//     var requireAs = proc.requireAs;
//     var relMap = {};
//     var modules = {};
//
//     if (_isEntry) {
//         cumulativeLines = _initialLines;
//     } else {
//         cumulativeLines += innerWrapperHeight;
//     }
//
//     // find unique require statements in this file
//     var reqs = [].concat(detective(file.contents), mockDetective(file.contents));
//     reqs = reqs.filter(function (value, index, self) {
//         return self.indexOf(value) === index;
//     });
//
//     // resolve each require string and add to collection
//     utils.each(reqs, function (req) {
//         var subfile = resolve(req, filepath, options.paths);
//         var subfilePath = subfile.path;
//         if (subfile.contents) {
//             if (history.indexOf(subfilePath) === -1) {
//                 var procSub = processFile(subfile, subfilePath, options);
//                 subfile.contents = procSub.contents;
//                 Object.assign(requireAs, procSub.requireAs);
//
//                 modules[subfilePath] = subfile;
//
//                 var subModules = {};
//                 if (modulesCache[subfilePath]) {
//                     subModules = modulesCache[subfilePath];
//                     // console.log();
//                     // console.log('getting from cache');
//                     // console.log(subfilePath);
//                     // console.log(subModules.modules);
//                 } else {
//                     subModules = findAllModules(subfile, options, history);
//                     // console.log();
//                     // console.log('adding to cache');
//                     // console.log(subfilePath);
//                     // console.log(subModules.modules);
//                     modulesCache[subfilePath] = subModules;
//                     history.pop();
//                 }
//
//                 Object.assign(modules, subModules.modules);
//                 Object.assign(requireAs, subModules.requireAs);
//
//                 subfile.relMap = subModules.relMap;
//                 relMap[req] = subfilePath;
//
//             } else {
//                 console.log('Module "' + req + '" is circular from ' + filepath);
//                 console.log(history);
//                 console.log();
//             }
//
//         } else {
//             console.log('Module "' + req + '" not found from ' + filepath);
//             if (options.paths) {
//                 console.log('   with paths: ' + options.paths);
//             }
//         }
//     });
//
//     return {
//         modules,
//         relMap,
//         requireAs,
//     };
// }
//
// function findModules(entryFile, options, initialLines) {
//     return findAllModules(entryFile, options, [], initialLines);
// }
//
// module.exports = findModules;
