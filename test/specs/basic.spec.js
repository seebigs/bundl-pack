const bundlPack = require('../../index.js');
const Bundl = require('bundl');
const path = require('path');

const lessProcessor = require('bundl-pack-less');

const fixturesPath = path.resolve(__dirname + '/../fixtures/commonjs/');

const bundlPackOptions = {
    less: lessProcessor,
};

const testsRan = true;
describe('require gets dependencies of all types', function (assert, done) {

    const expectedTestValue = '{' +
        '"css":"body{margin:0;background:#f66;content:\'\\\\e800\'}",' +
        '"html":"<div><h1 id=\\"willy\\" class=\\"wonka\\">Charlie\'s Friend</h1></div>",' +
        '"json":{"foo":["bar"]},' +
        '"less":".and .more{color:green}.foo{color:#00f}.foo .bar{color:red;content:\'\\\\02715\'}",' +
        '"path":"path"' +
    '}';

    const mappedDeps = [];
    const spyOnMapDependency = {
        exec: function (r) {
            spy.on(this, 'mapDependency', function (bundleName, srcPath) {
                mappedDeps.push(srcPath);
            });
            return r;
        },
    };

    new Bundl({ 'myBundle.js': '../fixtures/commonjs/entry.js' })
        .then(spyOnMapDependency)
        .then(bundlPack(bundlPackOptions))
        .go(function (resources) {
            const myBundle = resources['myBundle.js'];
            const contents = myBundle.contents.getString();

            describe('it finds and correctly bundles all dependencies', function (expect) {
                window.testValue = null;
                eval(contents);
                expect(JSON.stringify(window.testValue)).toBe(expectedTestValue);
            });

            describe('it builds a sourcemaps object', function (expect) {
                expect(myBundle.sourcemaps.length).toBe(9);
                expect(myBundle.sourcemaps[myBundle.sourcemaps.length - 1].generated.line).toBe(618);
            });

            describe('it maps dependencies to Bundl', function (expect) {
                const expectedDeps = [];
                const files = [
                    'entry.js',
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
                expectedDeps.splice(5, 0, path.resolve('node_modules/path-browserify/index.js'));

                expect(mappedDeps).toBe(expectedDeps);
            });

            assert(testsRan).toBe(true);
            done();
        });
});
