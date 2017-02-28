
var bundlpack = require('../index.js');
var bytes = require('bytes');
var consoleTable = require('console.table');
var fs = require('fs');
var lessProcessor = require('bundl-pack-less');
var ugly = require('uglify-js');
var utils = require('seebigs-utils');

var args = utils.args();

var outputPath = './test/compare/';
var entryPath = './test/fixtures/commonjs/entry.js';
var entryContents = utils.readFile(entryPath);
var paths = ['test/fixtures/commonjs'];
var autoInject = !!args.autoInject;

var r = {
    name: 'my_bundle.js',
    src: '../fixtures/commonjs/entry.js',
    contents: entryContents,
    sourcemaps: []
};


/* BROWSERIFY */
require('./compare_browserify.js')(entryPath, outputPath, autoInject);


/* WEBPACK */
require('./compare_webpack.js')(entryPath, outputPath, autoInject);


/* BUNDLPACK */
var bp = bundlpack({
    paths: paths,
    css: {
        autoInject: !!autoInject
    },
    json: {
        autoInject: !!autoInject
    },
    less: lessProcessor()
}).one(r.contents, r);

function minify (contents) {
    var opts = {
        charset: 'utf8',
        fromString: true
    };
    return ugly.minify(contents, opts).code;
}

var outname = 'bundlpack';
utils.writeFile(__dirname + '/compare/' + outname + '.js', bp.contents, done);
utils.writeFile(__dirname + '/compare/' + outname + '.min.js', minify(bp.contents), done);


/* COMPARE */

var filesWritten = 0;
function done () {
    filesWritten++;
    if (filesWritten >= 2) {
        setTimeout(displayComparisonTable, 1500); // try to ensure all files are written
    }
}

function displayComparisonTable () {
    var finalFiles = utils.listFiles(__dirname + '/compare');
    var toTable = [];
    finalFiles.forEach(function (ff) {
        var stats = fs.statSync(ff);
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
