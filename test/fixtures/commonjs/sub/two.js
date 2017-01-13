
module.exports = function () {
    return {
        css: require('../proc/proc.css'),
        html: require('../proc/proc.html'),
        json: require('../proc/proc.json'),
        less: require('../proc/proc.less')
    };
};

var willy = require('./unused.js');
