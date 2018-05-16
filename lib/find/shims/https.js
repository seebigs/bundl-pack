/**
 * Node's require('https') ported to work in browsers
 */

var http = require('http');
http.setDefaultProtocol('https:');

module.exports = http;
