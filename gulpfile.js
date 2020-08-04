const { src, dest, watch, series, parallel } = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const server = browserSync;

const paths = {
    source: './app',
    build: './build',
    images: './app/images',
    fonts: './app/fonts',
};

const files = {
    scssPath: 'app/scss/**/*.scss',
    jsPath: 'app/js/**/*.js',
    htmlPath: 'app/*.html',
    imgPath: 'app/images/*.*',
    fontsPath: 'app/fonts/*.*',
};

function scssTask(done) {
    return src(files.scssPath)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('app/css'));
    done();
}

/* Build Tasks */

function htmlBuild(done) {
    return src(`${paths.source}/*.html`)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest(paths.build));
    done();
}

function cssBuild(done) {
    return src(`${paths.source}/css/**/*.css`)
        .pipe(postcss([cssnano()]))
        .pipe(dest(`${paths.build}/css`));
    done();
}

function javascriptBuild(done) {
    return browserify({
        entries: [`${paths.source}/js/script.js`],
        transform: [babelify.configure({ presets: ['@babel/preset-env'] })],
    })
        .bundle()
        .pipe(source('script.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(dest(`${paths.build}/js`));
    done();
}

function imagesBuild(done) {
    src(files.imgPath).pipe(dest(`${paths.build}/images`));
    done();
}

function fontsBuild(done) {
    src(files.fontsPath).pipe(dest(`${paths.build}/fonts`));
    done();
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
    watch(
        [files.scssPath, files.htmlPath, files.jsPath, files.imgPath],
        series(parallel(scssTask, reload))
    );
}

exports.default = series(parallel(scssTask, serve), watchTask);
exports.build = parallel(
    javascriptBuild,
    htmlBuild,
    cssBuild,
    imagesBuild,
    fontsBuild
);
