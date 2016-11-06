/**
 * @file Gulp compile task configuration.
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
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

const gulp = require('gulp');
const closureCompiler = require('gulp-closure-compiler');
const header = require('gulp-header');
const fs = require('fs');

const config = require('../config').compile;

/* eslint-disable camelcase */
gulp.task('compile', () => {
  return gulp.src(config.src)
    .pipe(closureCompiler({
      fileName: config.output,
      compilerFlags: {
        warning_level: 'VERBOSE',
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ES6',
        language_out: 'ES5',
        jscomp_off: 'checkVars',
        externs: ['externs/*']
      }
    }))
    .pipe(header(fs.readFileSync('gulp/license-header.txt', 'utf8')))
    .pipe(gulp.dest(config.dest));
});
