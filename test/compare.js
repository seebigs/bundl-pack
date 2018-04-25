var $AST = require('../../parsetree-js'); // FIXME
var bundlpack = require('../index.js');
var bytes = require('bytes');
var consoleTable = require('console.table');
var del = require('del');
var fs = require('fs');
var lessProcessor = require('bundl-pack-less');
var uglify = require('uglify-js');
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
    contents: {
        parsed: new $AST(entryContents),
    },
    sourcemaps: [],
};

/* CLEAR */
del.sync([__dirname + '/compare/']);

/* BROWSERIFY */
require('./compare_browserify.js')(entryPath, outputPath, autoInject);

/* WEBPACK */
// require('./compare_webpack.js')(entryPath, outputPath, autoInject);

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
}).exec.call({}, r);

function minify (contents) {
    var opts = {
        charset: 'utf8',
        fromString: true
    };
    return uglify.minify(contents, opts).code;
}

var outname = 'bundlpack';
var contents = bp.contents.parsed.generate();
utils.writeFile(__dirname + '/compare/' + outname + '.js', contents, done);
utils.writeFile(__dirname + '/compare/' + outname + '.min.js', minify(contents), done);


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
