const bundlPack = require('../../index.js');
const Bundl = require('bundl');
const path = require('path');

const lessProcessor = require('bundl-pack-less');

let testsRun = 0;
describe('requireAs works properly', function (assert, done) {
    new Bundl({ 'myBundle.js': '../fixtures/commonjs/entry.js' })
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
            const myBundle = resources['myBundle.js'];
            const contents = myBundle.contents.getString();

            describe('respects when autoInject is false', function (expect) {
                expect(contents.indexOf('requireAs') !== -1).toBe(false, '(bundle still includes requireAs)');
            });

            assert(++testsRun).toBe(1);
            done();
        });
});

describe('requireAs works properly', function (assert, done) {
    new Bundl({ 'myBundle.js': '../fixtures/commonjs/entry.js' })
        .then(bundlPack())
        .go(function (resources) {
            const myBundle = resources['myBundle.js'];
            const contents = myBundle.contents.getString();

            describe('respects when autoInject is false', function (expect) {
                expect(contents.indexOf('requireAs') !== -1).toBe(true, '(bundle is missing requireAs)');
            });

            assert(++testsRun).toBe(2);
            done();
        });
});
