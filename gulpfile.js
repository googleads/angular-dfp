/**
* @file Gulp task configuration.
* @author Peter Goldsborough <peter@goldsborough.me>
* @license Apache
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
*/

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
  return del([
    'angular-dfp.min.js',
    'angular-dfp.js',
    'docs',
    'angular-dfp.es6'
  ]);
});

gulp.task('demo', ['transpile'], () => {
  return gulp.src('angular-dfp*.js')
             .pipe(gulp.dest('demo/static'));
});

gulp.task('default', ['lint', 'transpile', 'compile', 'docs', 'demo']);
