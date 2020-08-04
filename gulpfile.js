const { src, dest, watch, series, parallel } = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const htmlValidator = require('gulp-w3c-html-validator');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const ts = require('gulp-typescript');

const server = browserSync;
const tsProject = ts.createProject('tsconfig.json');

const paths = {
    source: './app',
    build: './build',
    images: './app/images',
    fonts: './app/fonts',
    js: './app/js',
};

const files = {
    scssPath: 'app/scss/**/*.scss',
    cssPath: 'app/css/**/*.css',
    jsPath: 'app/js/**/*.js',
    tsPath: 'app/ts/**/*.ts',
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

function tsTask(done) {
    return src(files.tsPath)
        .pipe(
            ts({
                noImplicitAny: true,
                outFile: 'tscompiled.js',
            })
        )
        .pipe(dest(paths.js));
    done();
}

/* LINTERS */

function jsLinter(done) {
    return src(files.jsPath)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());

    done();
}

/* BUILD TASKS */

function htmlBuild(done) {
    return src(`${paths.source}/*.html`)
        .pipe(htmlValidator())
        .pipe(htmlValidator.reporter())
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
        entries: [`${paths.source}/js/*.js`],
        transform: [babelify.configure({ presets: ['@babel/preset-env'] })],
    })
        .bundle()
        .pipe(source('*.js'))
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

/* RELOAD AND WATCH*/

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
    watch([files.scssPath], series(parallel(scssTask, reload)));
    watch([files.tsPath], series(parallel(tsTask, reload)));
    watch(
        [files.htmlPath, files.jsPath, files.imgPath],
        series(parallel(reload))
    );
    watch([files.jsPath], series(parallel(jsLinter, reload)));
}

exports.default = series(parallel(scssTask, serve), watchTask);
exports.build = parallel(
    jsLinter,
    javascriptBuild,
    htmlBuild,
    cssBuild,
    imagesBuild,
    fontsBuild
);
