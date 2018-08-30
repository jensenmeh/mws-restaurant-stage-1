var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 8000,
        open: false
    });

    gulp.watch('./*.html', ['reload']);
});

gulp.task('reload', function (done) {
    browserSync.reload();
    done();
});


gulp.task('default', ['html', 'sass', 'js', 'img'], function() {

});

gulp.task('html', function () {
  return gulp.src('./**.html')
  	.pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {
  return gulp.src('./js/**/*.js')
  	.pipe(gulp.dest('./dist/js'));
});

gulp.task('img', function () {
  return gulp.src('./img/**/*.jpg')
  	.pipe(gulp.dest('./dist/img'));
});


gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('clean', function () {
    return gulp.src('./dist/*', {read: false})
        .pipe(clean());
});