/**
 * @file Defines the `dfp-audience-pixel` directive.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

let angularDfp = (function(module) {
  /**
   *
   * The `dfp-audience-pixel` tag.
   *
   * Audience pixels are useful for getting audience impressions on parts of a
   * page that do not show ads. Usually, audience impressions are generated when
   * a user sees an ad (unit) and is then eventually added to that audience
   * segmenet. However, when you have no ads but still want to record an
   * impression for an audience segment, you can add a transparent 1x1 pixel to
   * do so.
   *
   * @see [Google DFP Support]{@link https://support.google.com/dfp_premium/answer/2508388?hl=en}
   *
   * @param {object} scope The angular scope.
   * @param {object} element The HTML element on which the directive is defined.
   * @param {object} attributes The attributes of the element.
   * @param {object} $injector The angular `$injector` service.
   */
  function dfpAudiencePixelDirective(scope, element, attributes, $injector) {
    const format = $injector.get('dfpFormat');

    const axel = String(Math.random());
    const random = axel * 10000000000000;

    let adUnit = '';
    if (scope.adUnit) {
      adUnit = format('dc_iu={0};', scope.adUnit);
    }

    let ppid = '';
    if (scope.ppid) {
      ppid = format('ppid={0};', scope.ppid);
    }

    const pixel = document.createElement('img');

    pixel.src = format(
       'https://pubads.g.doubleclick.net/activity;ord={0};dc_seg={1};{2}{3}',
       random,
       scope.segmentId,
       adUnit,
       ppid
     );

    pixel.width = 1;
    pixel.height = 1;
    pixel.border = 0;
    pixel.style.visibility = 'hidden';

    document.body.appendChild(pixel);
  }

  module.directive('dfpAudiencePixel', ['$injector', function($injector) {
    return {
      restrict: 'E',
      scope: {adUnit: '@', segmentId: '@', ppid: '@'},
      link: function() {
        dfpAudiencePixelDirective.apply(arguments.concat($injector));
      }
    };
  }]);

// eslint-disable-next-line
})(angularDfp || angular.module('angularDfp'));
