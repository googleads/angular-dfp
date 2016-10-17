/**
* @file A directive for supplying additional JavaScript to configure an ad slot.
*
* Since our library does not cover all parts of the GPT library, it may be
* necessary to add your own, additional JavaScript to further configure an
* ad slot. For this, the `dfp-script` directive allows writing inline or
* external JS and manipulate the ad slot. More precisely, the library will
* inject the slot object (which can be renamed) into the scope of the
* JavaScript. Moreover, you may inject your own `scope` object that will
* be available inside the script.
*
* The `dfp-script` tag must be nested directly under the main `dfp-ad` tag.
*
* @example <caption>Example usage of the `dfp-script` directive.</caption>
* <dfp-ad ad-unit="path/to/my/ad-unit">
*   <dfp-script slot-as="mySlot" scope="{ path: 'spaghetti' }">
*     if (mySlot.getAdUnitPath() == scope.path) {
*       mySlot.clearTargeting();
*     }
*   </dfp-script>
* </dfp-ad>
*
* @module dfp-script
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

// TODO: allows specifying `src="/path/to/javascript"`

// eslint-disable-next-line valid-jsdoc
(/** @lends module:dfp-script */ function(module) {
  'use strict';

  /**
  * Defines the `dfp-script` directive.
  *
  * The purpose of this directive is to allow additional operations on the ad
  * slot, in case any functionality was not covered by this library. More
  * precisely, the script is given access to the slot object (which may be
  * renamed, optionally) as well as a custom (optional) scope, to then perform
  * any further customizations.
  *
  * @private
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
      link: function(...args) {
        dfpScriptDirective.apply(null, args.concat($injector));
      }
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
