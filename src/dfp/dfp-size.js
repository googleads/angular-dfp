/**
* @file A directive for specifying an ad size.
*
* A `dfp-size` directive specifies a `(width, height)` pair of ad dimensions.
* This directive can not be defined on its own, but is only valid:
*
* 1. when nested directly under a `dfp-ad` directive, or
* 2. when nested directly under a `dfp-responsive` directive.
*
* In the former case, the `dfp-size` directive specifies a fixed ad-slot size as
* would be passed as the second parameter to the
* `googletag.pubads().defineSlot()`` method. In the latter case, the directive
* specifies a size mapping member for certain browser dimensions.
*
* @example <caption>Example usage of the `dfp-size` directive.</caption>
* <dfp-ad ad-unit="path/to/my/ad-unit">
*   <dfp-size width=728 height=90></dfp-size>
*   <dfp-responsive browser-width=1024 browser-height=800>
*     <dfp-size width=320 height=50></dfp-size>
*   </dfp-responsive>
* </dfp-ad>
*
* @see [dfp-ad]{@link module:dfp-ad}
* @see [dfp-responsive]{@link module:dfp-responsive}
*
* @module dfp-size
* @author Peter Goldsborough <peter@goldsborough.me>
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
(/** @lends module:dfp-size */ function(module) {
  'use strict';

  /**
  * The `dfp-size` directive.
  *
  * This directive, when nested under either the `dfp-ad` or `dfp-responsive`
  * tag, adds a size value to the parent. This size can either be given as
  * width and height dimension via attributes, or as any valid string size
  * (e.g. 'fluid') between the tags.
  *
  * @private
  * @param {Object} scope The angular scope.
  * @param {Object} element The HTML element on which the directive is defined.
  * @param {Object} attributes The attributes of the element.
  * @param {Object} parent     The parent controller.
  */
  function DFPSizeDirective(scope, element, attributes, parent) {
    // Only one of the two possible parents will be `null`
    // Pick the most nested parent (`dfp-responsive`)
    parent = parent[1] || parent[0];

    console.assert(parent);

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
})(angularDfp);
