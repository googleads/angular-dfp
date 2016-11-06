/**
 * @file Demo JavaScript.
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

'use strict';

// eslint-disable-next-line no-undef
let app = angular
  .module('angularDfpDemo', ['angularDfp', 'ngMaterial'])
  .config(['dfpRefreshProvider', function(dfpRefreshProvider) {
    dfpRefreshProvider.refreshInterval = '10s';
  }]);

// Configure angular expressions to use the {( ... )} instead of
// the default {{ ... }} to avoid collisions with Jinja2 in Flask
app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{(');
  $interpolateProvider.endSymbol(')}');
}]);

app.controller('DemoController', ['dfp', function(dfp) {
  dfp();
}]);
