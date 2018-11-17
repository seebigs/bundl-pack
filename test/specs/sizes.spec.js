const bundlPack = require('../../index.js');
const Bundl = require('bundl');

const lessProcessor = require('bundl-pack-less');

const testsRan = true;
describe('require gets dependencies of all types', function (assert, done) {
    new Bundl({
        'myBundle.js': '../fixtures/commonjs/entry.js',
        'myBundleSmall.js': '../fixtures/commonjs/entry.small.js',
    })
    .then(bundlPack({
        less: lessProcessor,
    }))
    .go(function (resources) {

        describe('large bundle is the correct size', function (expect) {
            const largeBundle = resources['myBundle.js'].contents.getString();
            expect(largeBundle.length).toBe(21612);
        });

        describe('small bundle is the correct size', function (expect) {
            const smallBundle = resources['myBundleSmall.js'].contents.getString();
            expect(smallBundle.length).toBe(1780);
        });

        new Bundl({
            'myBundle.js': '../fixtures/commonjs/entry.js',
            'myBundleSmall.js': '../fixtures/commonjs/entry.small.js',
        })
        .then(bundlPack({
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
        }))
        .go(function (resources) {

            describe('large bundle without requireAs is the correct size', function (expect) {
                const largeBundle = resources['myBundle.js'].contents.getString();
                expect(largeBundle.length).toBe(20820);
            });

            describe('small bundle without requireAs is the correct size', function (expect) {
                const smallBundle = resources['myBundleSmall.js'].contents.getString();
                expect(smallBundle.length).toBe(1696);
            });

            assert(testsRan).toBe(true);
            done();
        });
    });
});
