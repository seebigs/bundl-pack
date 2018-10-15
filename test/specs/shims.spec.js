const bundlPack = require('../../index.js');
const Bundl = require('bundl');
const path = require('path');

// create a global value that should be available within the wrapper
globalFoo = 'bar';

const testsRan = true;
describe('shims', function (assert, done) {
    new Bundl({ 'myBundle.js': '../fixtures/_shims.js' })
        .then(bundlPack())
        .go(function (resources) {
            const myBundle = resources['myBundle.js'];
            const contents = myBundle.contents.getString();
            require('fs').writeFileSync('test/compare/bundlpack.js', contents);
            eval(contents);

            describe('all shims provide what we think they do', function (expect) {
                expect(window.testValues.Buffer).toBe('function', 'Buffer');
                expect(window.testValues.buffer).toBe('function', 'buffer');
                // expect(window.testValues.crypto).toBe('a9993e364706816aba3e25717850c26c9cd0d89d', 'crypto');
                expect(window.testValues.domain).toBe('function', 'domain');
                expect(window.testValues.events).toBe('function', 'events');
                expect(window.testValues.http).toBe([ 'get', 'request', 'setDefaultProtocol' ], 'http');
                expect(window.testValues.https).toBe([ 'get', 'request', 'setDefaultProtocol' ], 'https');
                expect(window.testValues.indexof).toBe(3, 'indexof');
                expect(window.testValues.os).toBe('\n', 'os');
                expect(window.testValues.path).toBe('/foo/fighters', 'path');
                expect(window.testValues.process).toBe('/', 'process');
                expect(window.testValues.request).toBe([ 'get', 'post', 'put', 'head', 'delete' ], 'request');
                // expect(window.testValues.stream).toBe([ 'super_', 'Readable', 'Writable', 'Duplex', 'Transform', 'PassThrough', 'Stream' ], 'stream');
                expect(window.testValues.string_decoder).toBe('function', 'string_decoder');
                expect(window.testValues.url).toBe('example.com', 'url');
                expect(window.testValues.util).toBe([ 'debuglog', 'deprecate', 'format', 'inherits', 'inspect' ], 'util');
                expect(window.testValues.vm).toBe('function', 'vm');

                expect(window.testValues.globalValue).toBe('bar', 'globalValue');
            });

            assert(testsRan).toBe(true);
            done();
        });
});

//
// var bundlPack = require('../../index.js');
// var utils = require('seebigs-utils');
//

//
// function mockContents(c) {
//     var _c = c;
//     return {
//         getString: function () {
//             return _c;
//         },
//         set: function (newC) {
//             _c = newC;
//         },
//     };
// }
//
// describe('shims', function () {
//
//     var shimsFile = utils.readFile(__dirname + '/../fixtures/_shims.js');
//     var r = {
//         name: 'shims_bundle.js',
//         src: '../fixtures/_shims.js',
//         contents: mockContents(shimsFile),
//         sourcemaps: [],
//     };
//
//     describe('all work properly', function (expect) {
//         var bp = bundlPack({}).exec.call({}, r);
//         eval(bp.contents.getString());
//
//         expect(window.testValues.buffer).toBe(Buffer.poolSize, 'buffer');
//         // expect(window.testValues.crypto).toBe('a9993e364706816aba3e25717850c26c9cd0d89d', 'crypto');
//         expect(window.testValues.domain).toBe('function', 'domain');
//         expect(window.testValues.events).toBe('function', 'events');
//         expect(window.testValues.http).toBe([ 'get', 'request', 'setDefaultProtocol' ], 'http');
//         expect(window.testValues.https).toBe([ 'get', 'request', 'setDefaultProtocol' ], 'https');
//         expect(window.testValues.indexof).toBe(3, 'indexof');
//         expect(window.testValues.os).toBe('\n', 'os');
//         expect(window.testValues.path).toBe('/foo/fighters', 'path');
//         expect(window.testValues.process).toBe('/', 'process');
//         expect(window.testValues.request).toBe([ 'get', 'post', 'put', 'head', 'delete' ], 'request');
//         // expect(window.testValues.stream).toBe([ 'super_', 'Readable', 'Writable', 'Duplex', 'Transform', 'PassThrough', 'Stream' ], 'stream');
//         expect(window.testValues.string_decoder).toBe('function', 'string_decoder');
//         expect(window.testValues.url).toBe('example.com', 'url');
//         expect(window.testValues.util).toBe([ 'debuglog', 'deprecate', 'format', 'inherits', 'inspect' ], 'util');
//         expect(window.testValues.vm).toBe('function', 'vm');
//
//         expect(window.testValues.globalValue).toBe('bar', 'globalValue');
//     });
//
// });
