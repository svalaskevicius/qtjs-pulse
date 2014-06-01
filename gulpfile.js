var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');


var path = {
  src: './src/**/*.js',
  src_data: [
    './src/**/*.json',
    './src/**/*.qml',
    './node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js'
  ],
  test: './test/**/*.js',
  pkg: './package.json'
};


gulp.task('build_source', function() {
  return gulp.src(path.src)
  .pipe(traceur())
  .pipe(gulp.dest('dist'));
});

gulp.task('src_data', function(){
  return gulp.src(path.src_data)
  .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build_source', 'src_data']);

gulp.task('lint', function() {
  return gulp.src(path.src)
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('test', ['lint', 'build'], function () {
  return gulp.src(path.test)
  .pipe(mocha({reporter: 'spec'}));
});


// WATCH FILES FOR CHANGES
gulp.task('watch', ['test'], function() {
  return gulp.watch([path.src, path.test], ['test']);
});


gulp.task('default', ['test']);

