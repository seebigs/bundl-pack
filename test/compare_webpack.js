
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var webpack = require('webpack-stream');

function makeWebpackedFiles (entryPath, outputPath, autoInject) {
    var cssLoader = autoInject ? 'style!css' : 'css';
    var lessLoader = autoInject ? 'style!css!less' : 'css!less';

    return gulp.src(entryPath)
        .pipe(webpack({
            output: {
                filename: 'webpack.js'
            },
            module: {
                loaders: [
                    { test: /\.css$/, loader: cssLoader },
                    { test: /\.less$/, loader: lessLoader },
                    { test: /\.html$/, loader: 'html' },
                    { test: /\.json$/, loader: 'json' }
                ]
            },
            quiet: true

        })).on('error', function (err) {
            console.log(err);
            process.exit(1);
        })
        .pipe(gulp.dest(outputPath)).on('end', function () {
            gulp.src(outputPath + 'webpack.js')
                .pipe(rename({ extname: '.min.js' }))
                .pipe(uglify())
                .pipe(gulp.dest(outputPath));
        });
}

module.exports = makeWebpackedFiles;
