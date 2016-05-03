var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test-category', function() {
  var error = false;
  gulp.
    src('tests/test-category-api.js').
    pipe(mocha()).
    on('error', function() {
      console.log('Tests failed!');
      error = true;
    }).
    on('end', function() {
      if (!error) {
        console.log('Tests succeeded!');
      }
    });
});

gulp.task('watch', function() {
  gulp.watch(['./tests/test-category-api.js'], ['test-category']);
});