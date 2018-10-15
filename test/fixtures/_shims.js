
var Events = require('events');

window.testValues = {
    Buffer: typeof Buffer.alloc,
    buffer: typeof require('buffer').Buffer.alloc,
    // crypto: require('crypto').createHash('sha1').update('abc').digest('hex'),
    domain: typeof require('domain').createDomain,
    events: typeof new Events().emit,
    http: Object.keys(require('http')),
    https: Object.keys(require('https')),
    indexof: require('indexof')('foobar', 'bar'),
    os: require('os').EOL,
    path: require('path').join('/foo/bar', '../fighters'),
    process: require('process').cwd(),
    request: Object.keys(require('request')),
    // stream: Object.keys(require('stream')),
    string_decoder: typeof require('string_decoder').StringDecoder,
    url: require('url').parse('http://example.com').hostname,
    util: Object.keys(require('util')),
    vm: typeof require('vm').createScript,

    globalValue: globalFoo
};
