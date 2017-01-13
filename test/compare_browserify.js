
var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

function makeBrowserifiedFiles (entryPath, outputPath, autoInject) {
    return browserify(entryPath)
        .transform('html2js-browserify', { minify: true, collapseWhitespace: true })
        .transform('node-lessify', { textMode: true })
        .transform('browserify-css', { autoInject: autoInject, minify: true })
        .bundle().on('error', function (err) {
            console.log(err);
        })
        .pipe(source('browserify.js'))
        .pipe(gulp.dest(outputPath)).on('end', function () {
            gulp.src(outputPath + 'browserify.js')
                .pipe(rename({ extname: '.min.js' }))
                .pipe(uglify())
                .pipe(gulp.dest(outputPath));
        });
}

module.exports = makeBrowserifiedFiles;
