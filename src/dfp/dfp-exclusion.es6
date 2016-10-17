/**
 * @file Defines the `dfp-exclusion` directive.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

(function(module) {
  /**
   * The `dfp-exclusion` directive.
   *
   * This directive allows specifying a category exclusion label, such that ads
   * from that category exclusion will not show in this slot. This ensures, for
   * example, that airline ads don't show next
   * to articles of an airplane accident.
   *
   * @see [Google DFP Support]{@link https://support.google.com/dfp_premium/answer/2627086?hl=en}
   *
   * @param {Object} scope The angular scope.
   * @param {Object} element The HTML element on which the directive is defined.
   * @param {Object} attributes The attributes of the element.
   * @param {Object} ad The parent `dfp-ad` controller.
   */
  function dfpExclusionDirective(scope, element, attributes, ad) {
    ad.addExclusion(element.html());
  }

  module.directive('dfpExclusion', [function() {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      link: dfpExclusionDirective
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
