const gulp = require('gulp');

const eslint = require('gulp-eslint');

gulp.task('lint', () => {
  return gulp.src('src/**')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

const concat = require('gulp-concat');

gulp.task('concat', () => {
  return gulp.src('src/**')
             .pipe(concat('angular-dfp.es6'))
             .pipe(gulp.dest('.'));
});

const babel = require('gulp-babel');
const rename = require('gulp-rename');

gulp.task('transpile', ['concat'], () =>
  gulp.src(['angular-dfp.es6'])
      .pipe(babel({presets: ['es2015']}))
      .pipe(rename(path => { path.extname = '.js'; return path; }))
      .pipe(gulp.dest('.'))
);

const closureCompiler = require('gulp-closure-compiler');

/* eslint-disable camelcase */
gulp.task('compile', ['concat'], () => {
  return gulp.src(['angular-dfp.es6'])
    .pipe(closureCompiler({
      fileName: 'angular-dfp.min.js',
      compilerFlags: {
        warning_level: 'DEFAULT',
        language_in: 'ES6',
        language_out: 'ES5',
        jscomp_off: 'checkVars'
      }
    }))
    .pipe(gulp.dest('.'));
});

const esdoc = require('gulp-esdoc');

gulp.task('docs', () => {
  gulp.src("./src")
    .pipe(esdoc({
      destination: './docs',
      unexportIdentifier: true,
      autoPrivate: true,
      access: ['public', 'protected', 'private'],
      includeSource: true
    }));
});

const del = require('del');

gulp.task('clean', () => {
  return del(['build', 'enum-class.min.js']);
});

gulp.task('default', ['lint', 'transpile', 'compile', 'docs'], function() { });
