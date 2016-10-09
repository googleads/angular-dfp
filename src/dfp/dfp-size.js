/**
 * @file
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

let angularDfp = (function(module) {
  /**
   * The `dfp-size` directive.
   *
   * This directive, when nested under either the `dfp-ad` or `dfp-responsive`
   * tag, adds a size value to the parent. This size can either be given as
   * width and height dimension via attributes, or as any valid string size
   * (e.g. 'fluid') between the tags.
   *
   * @param {object} scope The angular scope.
   * @param {object} element The HTML element on which the directive is defined.
   * @param {object} attributes The attributes of the element.
   * @param {object} parent     The parent controller.
   */
  function DFPSizeDirective(scope, element, attributes, parent) {
    // Only one of the two possible parents will be `null`
    // Pick the most nested parent (`dfp-responsive`)
    parent = parent[1] || parent[0];

    if (scope.width && scope.height) {
      parent.addSize([scope.width, scope.height]);
    } else {
      parent.addSize(element[0].innerHTML);
    }
  }

  module.directive('dfpSize', [function() {
    return {
      restrict: 'E',
      require: ['?^^dfpAd', '?^^dfpResponsive'],
      scope: {width: '=', height: '='},
      link: DFPSizeDirective
    };
  }]);

// eslint-disable-next-line
})(angularDfp || angular.module('angularDfp'));
