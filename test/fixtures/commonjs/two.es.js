import * as unused from './sub/unused.js';

export function thing () {
    return {
        css: require('./proc/proc.css'),
        html: require('./proc/proc.html'),
        json: require('./proc/proc.json'),
        less: require('./proc/proc.less'),
        path: typeof require('path').resolve ? 'path' : 'invalid',
    };
};
