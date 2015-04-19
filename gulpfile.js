var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');

gulp.task('watch', function() {
  return gulp.watch(['src/**/*.es6', 'test/*.test.js'], ['build', 'test']);
});

gulp.task('test', ['build'], function() {
  return gulp.src('test/*.js', {read: false})
    .pipe(mocha())
    .on('error', console.log.bind(console));
});

gulp.task('build', function() {
  return gulp.src('src/**/*.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', console.log.bind(console))
        .pipe(sourcemaps.write('.'))
        .on('error', console.log.bind(console))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);