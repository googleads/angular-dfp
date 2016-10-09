/**
 * @file Defines the `dfp-video` directive.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

// eslint-disable-next-line no-undef, no-unused-vars
let angularDfpVideo = angular.module('angularDfp');

(function(module) {
  /**
   * The `dfp-video` directive.
   *
   * This directive enables video ads to be shown over videos,
   * using `videojs` and the IMA SDK.
   *
   * @param {Object} scope The angular scope.
   * @param {Object} element The HTML element on which the directive is defined.
   * @param {Object} attributes The attributes of the element.
   * @param {Object} $injector The Angular '$injector' service.
   */
  function dfpVideoDirective(scope, element, attributes, $injector) {
    const dfpIDGenerator = $injector.get('dfpIDGenerator');

     // Unpack jQuery object
    element = element[0];

     // Generate an ID or check for uniqueness of an existing one (true = forVideo)
    dfpIDGenerator(element, true);

    /* eslint-disable no-undef */
    /**
     * The videojs player object.
     * @type {videojs.Player}
     */
    const player = videojs(element.id);
    /* eslint-enable no-undef */

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

  return module;

// eslint-disable-next-line
})(angularDfpVideo);
