var $AST = require('../../../parsetree-js'); // FIXME
var bundlPack = require('../../index.js');
var nodeAsBrowser = require('node-as-browser');
var utils = require('seebigs-utils');

// provide browser constructs like document and window
nodeAsBrowser.init(global);

// create a global value that should be available within the wrapper
globalFoo = 'bar';

describe('shims', function () {

    var shimsFile = utils.readFile(__dirname + '/../fixtures/_shims.js');
    var r = {
        name: 'shims_bundle.js',
        src: '../fixtures/_shims.js',
        contents: {
            parsed: new $AST(shimsFile),
        },
        sourcemaps: [],
    };

    describe('all work properly', function (expect) {
        var bp = bundlPack({}).exec.call({}, r);
        eval(bp.contents.parsed.generate());

        expect(window.testValues.buffer).toBe(Buffer.poolSize, 'buffer');
        expect(window.testValues.crypto).toBe('a9993e364706816aba3e25717850c26c9cd0d89d', 'crypto');
        expect(window.testValues.domain).toBe('function', 'domain');
        expect(window.testValues.events).toBe('function', 'events');
        expect(window.testValues.http).toBe([ 'get', 'request', 'setDefaultProtocol' ], 'http');
        expect(window.testValues.https).toBe([ 'get', 'request', 'setDefaultProtocol' ], 'https');
        expect(window.testValues.indexof).toBe(3, 'indexof');
        expect(window.testValues.os).toBe('\n', 'os');
        expect(window.testValues.path).toBe('/foo/fighters', 'path');
        expect(window.testValues.process).toBe('/', 'process');
        expect(window.testValues.request).toBe([ 'get', 'post', 'put', 'head', 'delete' ], 'request');
        expect(window.testValues.stream).toBe([ 'super_', 'Readable', 'Writable', 'Duplex', 'Transform', 'PassThrough', 'Stream' ], 'stream');
        expect(window.testValues.string_decoder).toBe('function', 'string_decoder');
        expect(window.testValues.url).toBe('example.com', 'url');
        expect(window.testValues.util).toBe([ 'debuglog', 'deprecate', 'format', 'inherits', 'inspect' ], 'util');
        expect(window.testValues.vm).toBe('function', 'vm');

        expect(window.testValues.globalValue).toBe('bar', 'globalValue');
    });

});
