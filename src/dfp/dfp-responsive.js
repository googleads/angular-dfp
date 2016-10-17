/**
* @file A directive for giving an ad responsive sizes.
*
* The `dfp-responsive` mapping is the `angular-dfp` pendant to GPT's
* `sizeMapping` and allows mapping browser dimensions to ad sizes. More
* precisely, the `dfp-responsive` directive allows nesting one or more
* [`dfp-size`](@link module:dfp-size) tags, each specifying ad dimensions
* allowed for the given browser width and height (and higher ones).
*
* Using such mappings you can, for example, render `320x50` mobile leaderboards
* on smartphones and `728x90` leaderboards on desktops, all in the same ad slot.
*
* The browser height is optional and defaults to zero. It may not be required if
* you only care about browser widths (phone, tablet, desktop screen sizes).
*
* @example <caption>Example usage of the `dfp-size` directive.</caption>
* <dfp-ad ad-unit="path/to/my/ad-unit">
*   <dfp-responsive browser-width=320>
*     <dfp-size width=300 height=50></dfp-size>
*     <dfp-size width=320 height=50></dfp-size>
*   </dfp-responsive>
*   <dfp-responsive browser-width=1024 browser-height=800>
*     <dfp-size width=970 height=90></dfp-size>
*   </dfp-responsive>
* </dfp-ad>
*
* @see [`dfp-size`](@link module:dfp-size)
*
* @module dfp-responsive
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
(/** @lends module:dfp-responsive */ function(module) {
  'use strict';

  /**
  * The controller for the `dfp-responsive` directive.
  * @private
  */
  function DFPResponsiveController() {
    /**
    * The size of the browser.
    *
    * A `dfp-responsive` tag always has one fixed browser width and height, and
    * then many possible ad sizes viable for ad calls for those browser
    * dimensions.
    *
    * @type {Array}
    */
    const browserSize = Object.seal([
      this.browserWidth,
      this.browserHeight || 0
    ]);

    /**
    * The ad sizes for the browser dimensions.
    * @type {Array}
    */
    const adSizes = [];

    /**
    * Asserts if the state of the controller is valid.
    * @return {!boolean} True if the state of the controller is
    *                   ready to be fetched, else false.
    */
    function isValid() {
      if (browserSize.some(value => typeof value !== 'number')) return false;
      return adSizes.length > 0;
    }

    /**
    * Adds an ad size to the responsive mapping.
    * @param {Array} size A `[width, height]` array to add.
    */
    this.addSize = function(size) {
      adSizes.push(size);
    };

    /**
    * Retrieves the state of the controller.
    * @return {Object} The state of the controller, for use by the directive.
    */
    this.getState = function() {
      console.assert(isValid());
      return Object.freeze({
        browserSize: browserSize,
        adSizes: adSizes
      });
    };
  }

  /**
  * The directive for the responsive mapping.
  *
  * @private
  * @param {Object} scope The angular scope.
  * @param {Object} element The HTML element on which the directive is defined.
  * @param {Object} attributes The attributes of the element.
  * @param {Object} ad The parent `dfp-ad` controller.
  */
  function dfpResponsiveDirective(scope, element, attributes, ad) {
    const mapping = scope.controller.getState();
    ad.addResponsiveMapping(mapping);
  }

  module.directive('dfpResponsive', [function() {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      controller: DFPResponsiveController,
      controllerAs: 'controller',
      bindToController: true,
      link: dfpResponsiveDirective,
      scope: {browserWidth: '=', browserHeight: '='}
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
