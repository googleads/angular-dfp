/**
* @file Enables video ads on a video element.
*
* This directive uses the [videojs]{@link http://videojs.com/} library to serve
* video ads on an HTML5 video tag. The ad tag must be supplied as an attribute.
*
* TODO: example
*
* @module dfp-video
* @author Peter Goldsborough <peter@goldsborough.me>
* @author Jaime González García <vintharas@google.com>
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

// eslint-disable-next-line no-undef, no-unused-vars
let angularDfpVideo = angular.module('angularDfp');

// eslint-disable-next-line valid-jsdoc
(/** @lends module:dfp-video */ function(module) {
  'use strict';

  /**
  * The `dfp-video` directive.
  *
  * This directive enables video ads to be shown over videos,
  * using `videojs` and the IMA SDK.
  *
  * @private
  * @param {Object} scope The angular scope.
  * @param {Object} element The HTML element on which the directive is defined.
  * @param {Object} attributes The attributes of the element.
  * @param {Object} $injector The Angular '$injector' service.
  */
  function dfpVideoDirective(scope, element, attributes, $injector) {
    const dfpIDGenerator = $injector.get('dfpIDGenerator');

     // Unpack jQuery object
    element = element[0];

    // TODO: exception here
    console.assert(element.tagName === 'VIDEO');

     // Generate an ID or check for uniqueness of an existing one
    dfpIDGenerator(element);

    // eslint-disable-next-line no-undef
    const player = videojs(element.id);

     // Register the video slot with the IMA SDK
     // eslint-disable-next-line dot-notation
    player.ima({id: element.id, adTagUrl: scope['adTag']});
    player.ima.requestAds();
    player.ima.initializeAdDisplayContainer();
  }

  module.directive('dfpVideo', ['$injector', function($injector) {
    return {
      restrict: 'A',
      // eslint-disable-next-line quote-props
      scope: {'adTag': '@'},
      link: function(...args) {
        dfpVideoDirective.apply(null, args.slice(0, 3).concat($injector));
      }
    };
  }]);

  return module;

// eslint-disable-next-line
})(angularDfpVideo);
