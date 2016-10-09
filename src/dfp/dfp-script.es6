/**
 * @file Defines the `dfp-script` directive.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

(function(module) {
  /**
   * Defines the `dfp-script` directive.
   *
   * The purpose of this directive is to allow additional operations on the ad
   * slot, in case any functionality was not covered by this library. More
   * precisely, the script is given access to the slot object (which may be
   * renamed, optionally) as well as a custom (optional) scope, to then perform
   * any further customizations.
   *
   * @param {Object} scope The angular scope.
   * @param {Object} element The HTML element on which the directive is defined.
   * @param {Object} attributes The attributes of the element.
   * @param {Object} ad The parent `dfp-ad` controller.
   * @param {Object} $injector The Angular `$injector` service.
   */
  function dfpScriptDirective(scope, element, attributes, ad, $injector) {
    const format = $injector.get('dfpFormat');
    const script = format(
       '(function(scope, {0}) { {1} })',
       scope.slotAs || 'slot',
       element.html().trim()
     );

    // Now we `eval` the script and bind the scope attribute (if any)
    // eslint-disable-next-line no-eval
    ad.addScript(eval(script).bind(null, scope.scope));
  }

  module.directive('dfpScript', ['$injector', function($injector) {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      scope: {slotAs: '@', scope: '='},
      link: function() {
        dfpScriptDirective.apply(arguments.concat($injector));
      }
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
