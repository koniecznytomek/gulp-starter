const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();

const server = browserSync;

const files = {
    scssPath: 'app/scss/**/*.scss',
    jsPath: 'app/js/**/*.js',
    htmlPath: 'app/*.html',
};

function scssTask() {
    return src(files.scssPath)
        .pipe(sass())
        .pipe(dest('app/css'));
}

function reload(done) {
    server.reload();
    done();
}

function serve(done) {
    server.init({
        server: {
            baseDir: './app',
        },
    });
    done();
}

function watchTask() {
    watch([files.scssPath, files.htmlPath, files.jsPath], series(parallel(scssTask, reload)));
}

exports.default = series(parallel(scssTask, serve), watchTask);
