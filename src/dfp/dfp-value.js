/**
 * @file
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

let angularDfp = (function(module) {
  /**
   * The `dfp-value` directive.
   *
   * The `dfp-value` directive allows specifying multiple values for a single
   * key when nested in a `dfp-targeting` directive.
   *
   * @param {object} scope The angular scope.
   * @param {object} element The HTML element on which the directive is defined.
   * @param {object} attributes The attributes of the element.
   * @param {object} parent     The parent (`dfp-targeting`) controller.
   */
  function dfpValueDirective(scope, element, attributes, parent) {
    parent.addValue(element.html());
  }

  module.directive('dfpValue', [function() {
    return {
      restrict: 'E',
      require: '^^dfpTargeting',
      link: dfpValueDirective
    };
  }]);
// eslint-disable-next-line
})(angularDfp || angular.module('angularDfp'));
