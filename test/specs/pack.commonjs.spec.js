var bundlPack = require('../../index.js');
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

function mockContents(c) {
    var _c = c;
    return {
        getString: function () {
            return _c;
        },
        set: function (newC) {
            _c = newC;
        },
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
        '"css":"body{margin:0;background:#f66;content:\'\\\\e800\'}",' +
        '"html":"<div><h1 id=\\"willy\\" class=\\"wonka\\">Charlie\'s Friend</h1></div>",' +
        '"json":{"foo":["bar"]},' +
        '"less":".and .more{color:green}.foo{color:#00f}.foo .bar{color:red;content:\'\\\\02715\'}",' +
        '"path":{"sep":"/","delimiter":":"}' +
    '}';

    var r = {
        name: 'my_bundle.js',
        src: '../fixtures/commonjs/entry.js',
        contents: mockContents(entryFile),
        sourcemaps: [],
    };

    var r2 = {
        name: 'my_bundle.js',
        src: '../fixtures/commonjs/entry.js',
        contents: mockContents(entryFile),
        sourcemaps: [],
    };

    var rBabel = {
        name: 'my_bundle_es.js',
        src: '../fixtures/commonjs/entry_es.js',
        contents: mockContents(entryFileES),
        sourcemaps: [],
    };

    var rMocked = {
        name: 'my_bundle_mocked.js',
        src: '../fixtures/commonjs/entry_mocked.js',
        contents: mockContents(entryFileMocked),
        sourcemaps: [],
    };

    var rCached = {
        name: 'my_bundle.js',
        src: '../fixtures/commonjs/cache_get.js',
        contents: mockContents(entryFileCached),
        sourcemaps: [],
    };

    var rAuto = {
        name: 'my_bundle.js',
        src: '../fixtures/commonjs/entry.js',
        contents: mockContents(entryFile),
        sourcemaps: [],
    };

    describe('require gets dependencies of all types', function () {
        window.testValue = null;

        var mappedDeps = [];
        var fakeBundl = {
            isBundl: true,
            mapDependency: function (bundleName, srcPath) {
                mappedDeps.push(srcPath);
            },
        };

        var bp = bundlPack({
            paths: paths,
            less: lessProcessor,
        }).exec.call(fakeBundl, r);

        describe('it finds and correctly bundles all dependencies', function (expect) {
            eval(bp.contents.getString());
            expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
        });

        describe('it builds a sourcemaps object', function (expect) {
            expect(bp.sourcemaps.length).toBe(8);
        });

        describe('it maps dependencies to Bundl', function (expect) {
            var expectedDeps = [];

            var files = [
                'proc/proc.css',
                'proc/proc.html',
                'proc/proc.json',
                'proc/proc.less',
                'sub/unused.js',
                'sub/two.js',
                'one.js',
            ];

            files.forEach(function (file) {
                expectedDeps.push(fixturesPath + '/' + file);
            });

            var strangePathBrowserify = path.resolve('node_modules/path-browserify/index.js')
            expectedDeps.splice(4, 0, strangePathBrowserify);

            expect(mappedDeps).toBe(expectedDeps);
        });

    });

    describe('handles babel as processor', function (expect) {
        window.testValue = null;
        var bp = bundlPack({
            obscure: false,
            paths: paths,
            less: lessProcessor,
            js: babelProcessor,
        }).exec.call({}, rBabel);
        eval(bp.contents.getString());
        expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
    });

    describe('can be mocked', function (expect) {
        var bp = bundlPack({ paths: paths }).exec.call({}, rMocked);
        eval(bp.contents.getString());
        expect(window.testValue).toBe('mocked,css,html,json,less,path');
    });

    describe('can be cached', function (expect) {
        var bp = bundlPack({ paths: paths }).exec.call({}, rCached);
        eval(bp.contents.getString());
        expect(window.testValue).toBe('mutated');
    });

    describe('respects when autoInject is false', function (expect) {
        var bp = bundlPack({
            paths: paths,
            css: {
                autoInject: false
            },
            json: {
                autoInject: false
            },
            less: {
                autoInject: false,
                processor: lessProcessor,
            },
        }).exec.call({}, rAuto);
        var contents = bp.contents.getString();
        expect(contents.indexOf('requireAs') !== -1).toBe(false, '(bundle still includes requireAs)');
    });

    describe('autoInject works across caching', function (expect) {
        var bp = bundlPack({
            paths: paths,
            less: {
                processor: lessProcessor,
            },
        }).exec.call({}, r2);
        var contents = bp.contents.getString();
        expect(contents.indexOf('requireAs') !== -1).toBe(true, '(bundle is missing requireAs)');
    });

});
