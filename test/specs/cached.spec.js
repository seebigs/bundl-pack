const bundlPack = require('../../index.js');
const Bundl = require('bundl');
const path = require('path');

const testsRan = true;
describe('modules can be cached', function (assert, done) {
    new Bundl({ 'myBundle.js': '../fixtures/commonjs/entry.cached.js' })
        .then(bundlPack())
        .go(function (resources) {
            const myBundle = resources['myBundle.js'];
            const contents = myBundle.contents.getString();

            describe('can be cached', function (expect) {
                window.testValue = null;
                eval(contents);
                expect(window.testValue).toBe('mutated');
            });

            assert(testsRan).toBe(true);
            done();
        });
});
