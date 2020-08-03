var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync").create();

gulp.task("sass", function () {
  return gulp
    .src("app/scss/**/*.scss") // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest("app/css"))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
});

gulp.task("browserSync", function () {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
  });
});

gulp.task(
  "watch",
  gulp.parallel("sass", "browserSync", function () {
    gulp.watch("app/scss/**/*.scss", gulp.series("sass"));


    gulp.watch("app/*.html").on("change", browserSync.reload);
    gulp.watch("app/scss/**/*.scss").on("change", browserSync.reload);
  })
);
