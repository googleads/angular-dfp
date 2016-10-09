'use strict';

// eslint-disable-next-line no-undef
let app = angular
  .module('angularDfpDemo', ['angularDfp'])
  .config(['dfpRefreshProvider', function(dfpRefreshProvider) {
    dfpRefreshProvider.refreshInterval = 10000;
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
