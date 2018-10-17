var fs = require('fs');

function explainMsg (name) {
    return '// This shim is included because the `' + name + '` global is used in your bundle';
}

function readFile (path) {
    return fs.readFileSync(__dirname + path, 'utf8').slice(0,-1).split('module.exports = ').pop();
}

function get (modulesStr) {

    var globalsTop = 'global, window, document'; // added here so they can be minimized
    var globalsBottom = '_, _, _.document';
    var globalVarFinder = 'typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}';

    // TODO: the detection of global usages should be done with AST instead of RegExp

    if (modulesStr.search(/\WBuffer\W/) !== -1) { // global use of Buffer detected
        globalsTop += ', Buffer';
        globalsBottom += ', \n' + explainMsg('Buffer') + '\n' + readFile('/../find/shims/buffer.js') + '.Buffer';
    }

    if (modulesStr.search(/\Wprocess\.\w/) !== -1) { // global use of process detected
        globalsTop += ', process';
        globalsBottom += ', \n' + explainMsg('process') + '\n' + readFile('/../find/shims/process.js');
    }

    return {
        top: globalsTop,
        bottom: globalsBottom,
        varFinder: globalVarFinder,
    };
}

module.exports = {
    get: get
};
