var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');


var path = {
  src: './src/**/*.js',
  test: './test/**/*.js',
  pkg: './package.json'
};


// TRANSPILE ES6
gulp.task('build_source', function() {
  return gulp.src(path.src)
  .pipe(traceur())
  .pipe(gulp.dest('dist'));
});


gulp.task('test', ['build_source'], function () {
  return gulp.src(path.test)
  .pipe(mocha({reporter: 'spec'}));
});


// WATCH FILES FOR CHANGES
gulp.task('watch', ['test'], function() {
  return gulp.watch([path.src, path.test], ['test']);
});

gulp.task('build', ['build_source']);

gulp.task('default', ['test']);

