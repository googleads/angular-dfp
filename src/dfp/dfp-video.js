/**
 * @file Defines the `dfp-video` directive.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

let angularDfpVideo = (function(module) {
  /**
   * The `dfp-video` directive.
   *
   * This directive enables video ads to be shown over videos,
   * using `videojs` and the IMA SDK.
   *
   * @param {object} scope The angular scope.
   * @param {object} element The HTML element on which the directive is defined.
   * @param {object} attributes The attributes of the element.
   * @param {object} $injector The Angular '$injector' service.
   */
  function dfpVideoDirective(scope, element, attributes, $injector) {
    const dfpIDGenerator = $injector.get('dfpIDGenerator');

     // Unpack jQuery object
    element = element[0];

     // Generate an ID or check for uniqueness of an existing one (true = forVideo)
    dfpIDGenerator(element, true);

    /**
     * The videojs player object.
     * @type {videojs.Player}
     */
    const player = videojs(element.id);

     // Register the video slot with the IMA SDK
    player.ima({id: element.id, adTagUrl: scope.adTag});
    player.ima.requestAds();
    player.ima.initializeAdDisplayContainer();
  }

  module.directive('dfpVideo', ['$injector', function($injector) {
    return {
      restrict: 'AE',
      scope: {adTag: '@'},
      link: function() {
        dfpVideoDirective.apply(arguments.concat($injector));
      }
    };
  }]);

// eslint-disable-next-line
})(angularDfpVideo || angular.module('angularDfp'));
