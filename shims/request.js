/**
 * https://www.npmjs.com/package/request ported to work in browsers
 */

var fetch = require('fetch');
var Url = window.URL || window.webkitURL;

function parseOptions (args) {
    var init = args[0];
    var opts = {};

    if (typeof init === 'string') {
        opts.url = new Url(init);
    } else {
        opts.url = init.url || init.uri;
    }

    if (!opts.url) {
        throw new Error('url is required');
    }

    opts.method = (init.method || 'GET').toUpperCase();
    opts.callback = args[1] || init.callback;
    opts.headers = init.headers || {};

    return opts;
}

function ReqObject (options) {
    var _this = this;
    var callbacks = {};

    if (typeof options.callback === 'function') {
        callbacks.end = [options.callback];
    }

    _this.on = function (eventName, cb) {
        if (typeof cb === 'function') {
            callbacks[eventName] = callbacks[eventName] || [];
            callbacks[eventName].push(cb);
        }

        return _this;
    };

    _this.emit = function (eventName) {
        var ev = callbacks[eventName];
        if (ev) {
            var args = [].slice.call(arguments, 1);
            ev.forEach(function (cb) {
                cb.apply({}, args);
            });
        }

        return _this;
    };

    // web requests will finish whenever they want :/
    // so we just let nothing happen when you call this
    _this.end = function () {};

    function IncomingMessage (r) {
        r = r || {};
        this.headers = r.headers;
        this.method = r.method;
        this.statusCode = r.status;
        this.statusMessage = r.statusText;
        this.url = r.url;
    }

    function endSuccess (text, response) {
        var r = new IncomingMessage(response);
        _this.emit('data', text, r);
        _this.emit('response', text, r);
        _this.emit('end', null, r, text);
    }

    function endError (err, response) {
        var r = new IncomingMessage(response);
        _this.emit('error', err, r);
        _this.emit('end', err, r);
    }

    fetch(options.url, options)
        .then(function (response) {
            if (response && response.ok) {
                response.method = options.method;
                response.text().then(function (text) {
                    endSuccess(text, response);
                }).catch(function (err) {
                    endError(err, response);
                });
            } else {
                endError(new Error('no response'), response)
            }
        })
        .catch(function (err) {
            endError(err);
        });
}

// callback gets (error, responseObject, responseText)
function request () {
    return new ReqObject(parseOptions(arguments));
}

function createMethod (type) {
    return function () {
        var options = parseOptions(arguments);
        options.method = type;
        return new ReqObject(options);
    };
}

request.get = createMethod('GET');
request.post = createMethod('POST');
request.put = createMethod('PUT');
request.head = createMethod('HEAD');
request.delete = createMethod('DELETE');

module.exports = request;
