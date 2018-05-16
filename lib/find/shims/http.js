/**
 * Node's require('http') ported to work in browsers
 */

var request = require('request');
var url = require('url');

var defaultProtocol = 'http:';

function get (opts, cb) {
    var req = httpRequest(opts, cb);
	req.end();
	return req;
}

function httpRequest (opts, cb) {
    if (typeof opts === 'string') {
        opts = url.parse(opts);
    }

    var protocol = opts.protocol === 'https:' ? 'https:' : defaultProtocol;
    var host = opts.hostname || opts.host;
    var port = opts.port || '';
	var path = opts.path || opts.pathname || '/';

    var req = request({
        url: (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path,
        method: opts.method,
        headers: opts.headers
    });

    if (typeof cb === 'function') {
        req.on('response', cb);
    }

    return req;
}

function setDefaultProtocol (protocol) {
    defaultProtocol = protocol;
}

module.exports = {
    get: get,
    request: httpRequest,
    setDefaultProtocol: setDefaultProtocol
};
