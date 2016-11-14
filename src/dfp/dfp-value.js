/**
* @file Defines a value for a targeting key.
*
* This directive can be used in conjunction with the `dfp-targeting` directive
* when you want to supply more than one value for a key (if you only want one
* key, just use the `key` attribute on `dfp-targeting`).
*
* The value itself is taken from the inner contents of the `dfp-value` tag.
*
* @example <caption>Example usage of the `dfp-value` directive.</caption>
* <dfp-ad ad-unit="/path/to/my/ad-unit">
*   <dfp-targeting key="food">
*     <dfp-value>spam</dfp-value>
*     <dfp-value>ham</dfp-value>
*   </dfp-targeting>
* </dfp-ad>
*
* @module dfp-value
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

// eslint-disable-next-line valid-jsdoc
(/** @lends module:dfp-value */ function(module) {
  'use strict';

  /**
  * The `dfp-value` directive.
  *
  * The `dfp-value` directive allows specifying multiple values for a single
  * key when nested in a `dfp-targeting` directive.
  *
  * @private
  * @param {Object} scope The angular scope.
  * @param {Object} element The HTML element on which the directive is defined.
  * @param {Object} attributes The attributes of the element.
  * @param {Object} parent     The parent (`dfp-targeting`) controller.
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
})(angularDfp);
