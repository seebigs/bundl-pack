const bundlPack = require('../../index.js');
const Bundl = require('bundl');
const path = require('path');

const testsRan = true;
describe('modules can be mocked', function (assert, done) {
    new Bundl({ 'myBundle.js': '../fixtures/commonjs/entry.mocked.js' })
        .then(bundlPack())
        .go(function (resources) {
            const myBundle = resources['myBundle.js'];
            const contents = myBundle.contents.getString();

            describe('can be mocked', function (expect) {
                window.testValue = null;
                eval(contents);
                expect(window.testValue).toBe('mocked,css,html,json,less,path');
            });

            assert(testsRan).toBe(true);
            done();
        });
});
