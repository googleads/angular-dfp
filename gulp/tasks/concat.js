/**
 * @file Gulp concat task configuration.

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
const concat = require('gulp-concat');

const config = require('../config.js').concat;

gulp.task('concat', () => {
  return gulp.src(config.src)
             .pipe(concat(config.output))
             .pipe(gulp.dest(config.dest));
});
