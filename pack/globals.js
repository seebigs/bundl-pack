
var fs = require('fs');

function explainMsg (name) {
    return '// This shim is included because the `' + name + '` global is used in your bundle';
}

function readFile (path) {
    return fs.readFileSync(__dirname + path, 'utf8').slice(0,-1).split('module.exports = ').pop();
}

function get (modulesStr) {

    var globalsTop = 'window, document';
    var globalsBottom = 'window, document';
    var globalsFirst = '';

    if (modulesStr.search(/\WBuffer\W/) !== -1) { // global use of Buffer detected
        globalsTop += ', Buffer';
        globalsBottom += ', {}';
        globalsFirst += 'require([[function(require){\nBuffer=require("buffer").Buffer;Buffer.Buffer=Buffer;\n\n},{"buffer":1}]';
        globalsFirst += ',[function(require,module,exports){\n' + fs.readFileSync(require.resolve('buffer/'), 'utf8') + '\n},{"base64-js":2,"ieee754":3}]';
        globalsFirst += ',[function(require,module,exports){\n' + fs.readFileSync(require.resolve('base64-js/'), 'utf8') + '\n},{}]';
        globalsFirst += ',[function(require,module,exports){\n' + fs.readFileSync(require.resolve('ieee754/'), 'utf8') + '\n},{}]';
        globalsFirst += ']);\n\n';
    }

    if (modulesStr.search(/\Wprocess\.\w/) !== -1) { // global use of process detected
        globalsTop += ', process';
        globalsBottom += ', \n' + explainMsg('process') + '\n' + readFile('/../shims/process.js');
    }

    return {
        top: globalsTop,
        bottom: globalsBottom,
        first: globalsFirst
    };
}

module.exports = {
    get: get
};
