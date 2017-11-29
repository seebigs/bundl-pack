var bundlPack = require('../../index.js');
var $AST = require('../../../dollar-ast'); // FIXME
var fs = require('fs');
var nodeAsBrowser = require('node-as-browser');
var path = require('path');
var utils = require('seebigs-utils');

var babelProcessor = require('bundl-pack-babel');
var lessProcessor = require('bundl-pack-less');

// provide browser constructs like document and window
nodeAsBrowser.init(global);

function getRequiredFiles (name) {
    var directedName = './test/fixtures/commonjs/' + name;
    return {
        absPath: path.resolve(directedName),
        contents: utils.readFile(directedName)
    };
}

describe('CommonJS', function () {

    var entryFile = utils.readFile('./test/fixtures/commonjs/entry.js');
    var entryFileES = utils.readFile('./test/fixtures/commonjs/entry_es.js');
    var entryFileMocked = utils.readFile('./test/fixtures/commonjs/entry_mocked.js');
    var entryFileCached = utils.readFile('./test/fixtures/commonjs/entry_cached.js');
    var paths = ['test/fixtures/commonjs'];
    var fixturesPath = path.resolve(__dirname + '/../fixtures/commonjs/');
    var expectedTestValue = '{' +
        '"css":"body{margin:0;background:#f66}",' +
        '"html":"<div><h1 id=\\"willy\\" class=\\"wonka\\">Charlie\'s Friend</h1></div>",' +
        '"json":{"foo":["bar"]},' +
        '"less":".and .more{color:green}.foo{color:#00f}.foo .bar{color:red}",' +
        '"path":{"sep":"/","delimiter":":"}' +
    '}';

    var r = {
        name: 'my_bundle.js',
        src: '../fixtures/commonjs/entry.js',
        contents: {
            tree: new $AST(entryFile),
        },
        sourcemaps: [],
    };

    // var rBabel = {
    //     name: 'my_bundle_es.js',
    //     src: '../fixtures/commonjs/entry_es.js',
    //     contents: new $AST(entryFileES),
    //     sourcemaps: []
    // };

    // var rMocked = {
    //     name: 'my_bundle_mocked.js',
    //     src: '../fixtures/commonjs/entry_mocked.js',
    //     contents: new $AST(entryFileMocked),
    //     sourcemaps: []
    // };
    //
    // var rCached = {
    //     name: 'my_bundle.js',
    //     src: '../fixtures/commonjs/cache_get.js',
    //     contents: new $AST(entryFileCached),
    //     sourcemaps: []
    // };

    describe('require gets dependencies of all types', function () {

        var mappedDeps = [];
        var fakeBundl = {
            isBundl: true,
            mapDependency: function (bundleName, srcPath) {
                mappedDeps.push(srcPath);
            },
        };

        var bp = bundlPack({ paths: paths, less: lessProcessor() }).exec.call(fakeBundl, r);

        describe('it finds and correctly bundles all dependencies', function (expect) {
            eval(bp.contents.tree.generate());
            expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
        });

        describe('it builds a sourcemaps object', function (expect) {
            expect(bp.sourcemaps.length).toBe(8);
        });

        describe('it maps dependencies to Bundl', function (expect) {
            var expectedDeps = [];

            var files = [
                'one.js',
                'sub/two.js',
                'proc/proc.css',
                'proc/proc.html',
                'proc/proc.json',
                'proc/proc.less',
                'sub/unused.js'
            ];

            files.forEach(function (file) {
                expectedDeps.push(fixturesPath + '/' + file);
            });

            var strangePathBrowserify = path.resolve('node_modules/path-browserify/index.js')
            expectedDeps.splice(expectedDeps.length - 1, 0, strangePathBrowserify);

            expect(mappedDeps).toBe(expectedDeps);
        });

    });

    // xdescribe('handles babel as processor', function (expect) {
    //     var b = bundlPack({
    //         paths: paths,
    //         less: lessProcessor(),
    //         js: babelProcessor()
    //     }).exec.call(fakeBundl, rBabel);
    //     eval(b.contents);
    //     expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
    // });
    //
    // describe('can be mocked', function (expect) {
    //     var b = bundlPack({ paths: paths }).exec.call(fakeBundl, rMocked);
    //     eval(b.contents);
    //     expect(window.testValue).toBe('mocked,css,html,json,less,path');
    // });
    //
    // describe('can be cached', function (expect) {
    //     var b = bundlPack({ paths: paths }).exec.call(fakeBundl, rCached);
    //     eval(b.contents);
    //     expect(window.testValue).toBe('mutated');
    // });
    //
    // describe('respects when autoInject is false', function (expect) {
    //     var b = bundlPack({
    //         paths: paths,
    //         css: {
    //             autoInject: false
    //         },
    //         json: {
    //             autoInject: false
    //         },
    //         less: lessProcessor({
    //             autoInject: false
    //         })
    //     }).exec.call(fakeBundl, r);
    //
    //     expect(b.contents.indexOf('requireAs') !== -1).toBe(false, '(bundle still includes requireAs)');
    // });

});
