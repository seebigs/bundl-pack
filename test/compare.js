const Bundl = require('bundl');
const bundlPack = require('../index.js');
const bytes = require('bytes');
const consoleTable = require('console.table');
const del = require('del');
const fs = require('fs');
const lessProcessor = require('bundl-pack-less');
const uglify = require('uglify-js');
const utils = require('seebigs-utils');

const args = utils.args();

const outputPath = './test/compare/';
const entryPath = './test/fixtures/commonjs/entry.js';
const autoInject = !!args.autoInject;

function minify(contents) {
    const uglified = uglify.minify(contents);
    if (uglified.error) {
        throw uglified.error;
    } else {
        return uglified.code;
    }
}

/* CLEAR */
del.sync([__dirname + '/compare/']);

/* BROWSERIFY */
require('./compare_browserify.js')(entryPath, outputPath, autoInject);

/* WEBPACK */
// require('./compare_webpack.js')(entryPath, outputPath, autoInject);

/* BUNDLPACK */
new Bundl({ 'myBundle.js': './fixtures/commonjs/entry.js' })
    .then(bundlPack({
        css: {
            autoInject: !!autoInject
        },
        json: {
            autoInject: !!autoInject
        },
        less: {
            autoInject: !!autoInject,
            processor: lessProcessor,
        },
    }))
    .go(function (resources) {
        const myBundle = resources['myBundle.js'];
        const contents = myBundle.contents.getString();
        utils.writeFile(__dirname + '/compare/bundlpack.js', contents, done);
        utils.writeFile(__dirname + '/compare/bundlpack.min.js', minify(contents), done);
    });


/* COMPARE */

let filesWritten = 0;
function done () {
    filesWritten++;
    if (filesWritten >= 2) {
        setTimeout(displayComparisonTable, 1500); // try to ensure all files are written
    }
}

function displayComparisonTable () {
    const finalFiles = utils.listFiles(__dirname + '/compare');
    const toTable = [];
    finalFiles.forEach(function (ff) {
        const stats = fs.statSync(ff);
        toTable.push({
            bundle: ff.split('/').pop(),
            size: stats.size,
            readable: bytes(stats.size)
        });
    });
    toTable.sort(function (a, b) {
        if (a.size > b.size) {
            return 1
        } else {
            return -1;
        }
    });
    console.log();
    console.table(toTable);
}
