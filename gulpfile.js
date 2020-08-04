const { src, dest, watch, series, parallel } = require('gulp');
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const server = browserSync;

const paths = {
  source: './app',
  build: './build',
};

const files = {
  scssPath: 'app/scss/**/*.scss',
  jsPath: 'app/js/**/*.js',
  htmlPath: 'app/*.html',
};


function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(dest('app/css'));
}

function javascriptBuild() {
  return (
    browserify({
      entries: [`${paths.source}/js/script.js`],
      transform: [babelify.configure({ presets: ["@babel/preset-env"] })]
    })
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(dest(`${paths.build}/js`))
  );
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
    [files.scssPath, files.htmlPath, files.jsPath],
    series(parallel(scssTask, reload)),
  );
}

exports.default = series(parallel(scssTask, serve), watchTask);
exports.build = javascriptBuild;

