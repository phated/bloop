var gulp = require('gulp');

var cp = require('child_process');

var bloop = require('./bloop');

function clean(cb) {
  cp.exec('rm -r dist/', function() {
    cb();
  });
}

function build() {
  return bloop.src('src/*.js')
    .pipe(bloop.mangle())
    .pipe(gulp.dest('dist/'));
}

exports.clean = clean;
exports.build = build;
exports.default = gulp.series(clean, build)
