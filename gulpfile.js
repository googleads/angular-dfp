const gulp = require('gulp');

const eslint = require('gulp-eslint');

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
  return gulp.src(['enum-class.js', 'test.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

const babel = require('gulp-babel');
const rename = require('gulp-rename');

gulp.task('transpile', () =>
  gulp.src(['enum-class.es6', 'test.es6'])
      .pipe(babel({presets: ['es2015']}))
      .pipe(rename(path => { path.extname = '.js'; return path; }))
      .pipe(gulp.dest('build/'))
);

const ava = require('gulp-ava');

gulp.task('test', ['transpile'], () =>
    gulp.src('build/test.js')
        .pipe(ava({verbose: true}))
);

const closureCompiler = require('gulp-closure-compiler');

/* eslint-disable camelcase */
gulp.task('compile', () => {
  return gulp.src(['enum-class.es6'])
    .pipe(closureCompiler({
      fileName: 'enum-class.min.js',
      compilerFlags: {
        warning_level: 'VERBOSE',
        language_in: 'ES6',
        language_out: 'ES5'
      }
    }))
    .pipe(gulp.dest('build'));
});

const esdoc = require("gulp-esdoc");

gulp.task('docs', () => {
  gulp.src(".")
    .pipe(esdoc({
      destination: "./docs",
      includes: ['enum-class.es6'],
      unexportIdentifier: true,
      access: ["public", "protected"],
      includeSource: true
    }));
});

const del = require('del');

gulp.task('clean', () => {
  return del(['build', 'enum-class.min.js']);
});

gulp.task('default', ['lint', 'test', 'compile', 'docs'], function() { });
