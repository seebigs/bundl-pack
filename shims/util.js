/**
 * Node's require('util') ported to work in browsers
 */

function debuglog (label) {
    return function () {
        console.log(label + ':');
        console.log.apply(this, arguments);
    };
}

function deprecate (fn, warn) {
    return function () {
        console.log('DeprecationWarning: ' + warn);
        fn.apply(this, arguments);
    };
}

function format (f) {
    if (typeof f !== 'string') {
        const objects = new Array(arguments.length);
        for (var index = 0; index < arguments.length; index++) {
            objects[index] = arguments[index];
        }
        return objects.join(' ');
    }

    var argLen = arguments.length;

    if (argLen === 1) return f;

    var str = '';
    var a = 1;
    var lastPos = 0;
    for (var i = 0; i < f.length;) {
        if (f.charCodeAt(i) === 37 /*'%'*/ && i + 1 < f.length) {
            switch (f.charCodeAt(i + 1)) {
                case 100: // 'd'
                    if (a >= argLen)
                        break;
                    if (lastPos < i)
                        str += f.slice(lastPos, i);
                    str += Number(arguments[a++]);
                    lastPos = i = i + 2;
                    continue;
                case 106: // 'j'
                    if (a >= argLen)
                        break;
                    if (lastPos < i)
                        str += f.slice(lastPos, i);
                    str += tryStringify(arguments[a++]);
                    lastPos = i = i + 2;
                    continue;
                case 115: // 's'
                    if (a >= argLen)
                        break;
                    if (lastPos < i)
                        str += f.slice(lastPos, i);
                    str += String(arguments[a++]);
                    lastPos = i = i + 2;
                    continue;
                case 37: // '%'
                    if (lastPos < i)
                        str += f.slice(lastPos, i);
                    str += '%';
                    lastPos = i = i + 2;
                    continue;
            }
        }
        ++i;
    }
    if (lastPos === 0)
        str = f;
    else if (lastPos < f.length)
        str += f.slice(lastPos);
    while (a < argLen) {
        const x = arguments[a++];
        if (x === null || (typeof x !== 'object' && typeof x !== 'symbol')) {
            str += ' ' + x;
        } else {
            str += ' ' + x;
        }
    }
    return str;
}

function inherits (SubClass, SuperClass) {
    for (var x in SuperClass.prototype) {
        SubClass.prototype[x] = SuperClass.prototype[x];
    }
    return SubClass;
}

function inspect (thing) {
    return thing ? (typeof thing === 'object' ? JSON.stringify(thing) : thing.toString()) : thing;
}

module.exports = {
    debuglog: debuglog,
    deprecate: deprecate,
    format: format,
    inherits: inherits,
    inspect: inspect
};
