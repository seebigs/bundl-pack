/**
 * Fetch polyfill
 */

function getRequestObject () {
    if (/msie [6-9]/i.test(window.navigator.userAgent)) { // IE9 or lower
        return window.XDomainRequest && new window.XDomainRequest();
    }
    return window.XMLHttpRequest && new window.XMLHttpRequest();
}

function handleResponse (responseText, url, resolve, reject) {
    if (responseText) {
        var servlet = url.split('?')[0].split('/').pop();

        var responseJSON = {};
        try {
            responseJSON = JSON.parse(responseText);
        } catch (err) {}

        resolve({
            ok: true,
            status: 200,
            json: function () {
                return Promise.resolve(responseJSON);
            },
            text: function () {
                return Promise.resolve(responseText);
            }
        });

    } else {
        reject(new Error('Fetch: missing responseText'));
    }
}

function doXHR (url, options, resolve, reject) {
    var r = getRequestObject();
    if (r) {
        var responseHandled = false;

        r.onreadystatechange = function () {
            if (r.readyState === 4) {
                if (!responseHandled) {
                    responseHandled = true;
                    if (r.status === 200) {
                        handleResponse(r.responseText, url, resolve, reject);
                    } else {
                        reject(new Error('Fetch: failed ' + r.status, url));
                    }
                }
            }
        };

        r.open('GET', url, true);

        // must come after r.open and before r.send for IE
        r.timeout = 10000;

        // must come after r.open for IE
        if (options.credentials === 'include') {
            r.withCredentials = true;
        }

        r.ontimeout = function () {
            reject(new Error('Fetch: timed out', url));
        };

        r.onerror = function () {
            reject(new Error('Fetch: failed', url));
        };

        r.onprogress = function () {
            // set as empty fn to prevent bugs
        };

        r.onload = function() {
            if (!responseHandled) {
                responseHandled = true;
                handleResponse(r.responseText, url, resolve, reject);
            }
        };

        r.send();
    }
}

function fetchPolyfill (url, options) {
    options = options || {};
    return new Promise(function (resolve, reject) {
        doXHR(url, options, resolve, reject);
    });
}


module.exports = window.fetch || fetchPolyfill;
