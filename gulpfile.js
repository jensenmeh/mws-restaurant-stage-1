var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 8000,
        open: false
    });

    gulp.watch('./*.html', ['reload']);
    gulp.watch('./sass/**/*.scss', ['reload']);
    gulp.watch('./js/**/*.js', ['reload']);
    gulp.watch('./sw.js', ['reload']);
});

gulp.task('reload', ['default'],function (done) {
    browserSync.reload();
    done();
});


gulp.task('default', ['html', 'sass', 'css', 'webfonts', 'js', 'sw', 'img', 'manifest'], function() {

});

gulp.task('html', function () {
  return gulp.src('./**.html')
  	.pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {
  return gulp.src('./js/**/*.js')
  	.pipe(gulp.dest('./dist/js'));
});

gulp.task('sw', function () {
  return gulp.src('./sw.js')
    .pipe(gulp.dest('./dist'));
});

gulp.task('img', function () {
  return gulp.src('./img/**/')
  	.pipe(gulp.dest('./dist/img'));
});

gulp.task('manifest', function () {
  return gulp.src('./manifest.json')
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('css', function () {
  return gulp.src('./sass/**/*.css')
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('webfonts', function () {
  return gulp.src('./webfonts/*')
    .pipe(gulp.dest('./dist/webfonts/'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('clean', function () {
    return gulp.src('./dist/*', {read: false})
        .pipe(clean());
});