/**
* @file Defines a value for a category exclusion
*
* This directive allows specifying a category exclusion label, such that ads
* from that category exclusion will not show in this slot. This ensures, for
* example, that airline ads don't show next to articles of an airplane
* accident.
*
* The value itself is taken from the inner contents of the `dfp-exclusion` tag.
*
* @example <caption>Example usage of the `dfp-exclusion` directive.</caption>
* <dfp-ad ad-unit="/path/to/my/ad-unit">
*   <dfp-exclusion>airlines</dfp-exclusion>
* </dfp-ad>
*
* @module dfp-exclusion
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
(/** @lends module:dfp-targeting */ function(module) {
  'use strict';

  /**
  * The `dfp-exclusion` directive.
  *
  * @private
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
