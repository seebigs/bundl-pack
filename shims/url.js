/**
 * Node's require('url') ported to work in browsers
 */

var Url = window.URL || window.webkitURL;

function format (urlObject) {
    return urlObject.href;
}

function parse (str) {
    try {
        return new Url(str);
    } catch (err) {
        var absPath = str.charAt(0) === '/';
        var u = new Url('http://temp.com' + (absPath ? '' : '/') + str);
        return {
            href: str,
            pathname: absPath ? u.pathname : u.pathname.substr(1),
            hash: u.hash,
            search: u.search,
            searchParams: u.searchParams
        };
    }
}

function resolve (from, to) {
    var base = path = '';

    try {
        var parsed = new Url(from);
        base = parsed.origin;
        path = parsed.pathname;
    } catch (err) {
        console.log(err);
        path = from;
    }

    if (to.charAt(0) === '/') {
        return base + to;
    } else {
        path = path.split('/');
        path.pop();
        return base + path.join('/') + '/' + to;
    }
}

module.exports = {
    format: format,
    parse: parse,
    resolve: resolve
};
