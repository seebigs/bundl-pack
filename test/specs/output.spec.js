const bundlPack = require('../../index.js');
const Bundl = require('bundl');

const lessProcessor = require('bundl-pack-less');

const testsRan = true;
describe('output is as expected', function (assert, done) {
    new Bundl({
        'first.js': '../fixtures/commonjs/entry.js',
        'second.js': '../fixtures/commonjs/entry.small.js',
        'third.js': '../fixtures/commonjs/entry.js',
        'fourth.js': '../fixtures/commonjs/entry.small.js',
    })
    .then(bundlPack({
        less: lessProcessor,
    }))
    .go(function (resources) {

        describe('first (large) bundle is the correct size', function (expect) {
            const largeBundle = resources['first.js'].contents.getString();
            expect(largeBundle.length).toBe(21612);
        });

        describe('second (small) bundle is the correct size', function (expect) {
            const smallBundle = resources['second.js'].contents.getString();
            expect(smallBundle.length).toBe(1780);
        });

        describe('thrid (large) bundle is the correct size again', function (expect) {
            const largeBundleAgain = resources['third.js'].contents.getString();
            expect(largeBundleAgain.length).toBe(21612);
        });

        describe('fourth (small) bundle is the correct size again', function (expect) {
            const smallBundle = resources['fourth.js'].contents.getString();
            expect(smallBundle.length).toBe(1780);
        });

        new Bundl({
            'first.js': '../fixtures/commonjs/entry.js',
            'second.js': '../fixtures/commonjs/entry.small.js',
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
                const largeBundle = resources['first.js'].contents.getString();
                expect(largeBundle.length).toBe(20820);
            });

            describe('small bundle without requireAs is the correct size', function (expect) {
                const smallBundle = resources['second.js'].contents.getString();
                expect(smallBundle.length).toBe(1696);
            });

            assert(testsRan).toBe(true);
            done();
        });
    });
});
