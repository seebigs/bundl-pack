
var bundlPack = require('../../index.js');
var fs = require('fs');
var nodeAsBrowser = require('node-as-browser');
var path = require('path');
var utils = require('seebigs-utils');

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
    var paths = ['test/fixtures/commonjs'];
    var fixturesPath = path.resolve(__dirname + '/../fixtures/commonjs/');
    var expectedTestValue = '{"css":"body{margin:0;background:#f66}","html":"<div><h1 id=\\"willy\\" class=\\"wonka\\">Charlie\'s Friend</h1></div>","json":{"foo":["bar"]},"less":".foo{color:#00f}.foo .bar{color:red}"}';

    var r = {
        name: 'my_bundle.js',
        src: '../fixtures/commonjs/entry.js',
        contents: entryFile
    };

    describe('r is optional', function (expect) {
        var bp = bundlPack({ paths: paths, less: lessProcessor() }).one(r.contents);
        eval(bp.contents);
        expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
    });

    describe('require gets dependencies of all types', function () {

        describe('it builds a changemap', function (expect) {
            var expectedChangeMap = {
                '#entry': 'my_bundle.js',
            };

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
                expectedChangeMap[fixturesPath + '/' + file] = 'my_bundle.js';
            })

            var bp = bundlPack({ paths: paths }).one(r.contents, r);
            expect(bp.changemap).toBe(expectedChangeMap);
        });

        describe('it finds and correctly bundles all dependencies', function (expect) {
            var bp = bundlPack({ paths: paths, less: lessProcessor() }).one(r.contents, r);
            eval(bp.contents);
            expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
        });

    });

    describe('respects when autoInject is false', function (expect) {
        var b = bundlPack({
            paths: paths,
            css: {
                autoInject: false
            },
            json: {
                autoInject: false
            }
        }).one(r.contents, r);

        expect(b.contents.indexOf('requireAs') !== -1).toBe(false, '(bundle still includes requireAs)');
    });

});
