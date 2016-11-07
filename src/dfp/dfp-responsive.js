/**
* @file A directive for giving an ad responsive sizes.
*
* The `dfp-responsive` mapping is the `angular-dfp` pendant to GPT's
* `sizeMapping` and allows mapping viewport dimensions to ad sizes. More
* precisely, the `dfp-responsive` directive allows nesting one or more
* [`dfp-size`](@link module:dfp-size) tags, each specifying ad dimensions
* allowed for the given viewport width and height (and higher ones).
*
* Using such mappings you can, for example, render `320x50` mobile leaderboards
* on smartphones and `728x90` leaderboards on desktops, all in the same ad slot.
*
* The viewport height is optional and defaults to zero. It may not be required if
* you only care about viewport widths (phone, tablet, desktop screen sizes).
*
* @example <caption>Example usage of the `dfp-size` directive.</caption>
* <dfp-ad ad-unit="path/to/my/ad-unit">
*   <dfp-responsive viewport-width=320>
*     <dfp-size width=300 height=50></dfp-size>
*     <dfp-size width=320 height=50></dfp-size>
*   </dfp-responsive>
*   <dfp-responsive viewport-width=1024 viewport-height=800>
*     <dfp-size width=970 height=90></dfp-size>
*   </dfp-responsive>
* </dfp-ad>
*
* @see [`dfp-size`](@link module:dfp-size)
*
* @module dfp-responsive
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

// eslint-disable-next-line valid-jsdoc
(/** @lends module:dfp-responsive */ function(module) {
  'use strict';

  /**
  * The controller for the `dfp-responsive` directive.
  * @param {Function} DFPIncompleteError The `DFPIncompleteError` service.
  * @param {Function} DFPTypeError The `DFPTypeError` service.
  * @private
  */
  function DFPResponsiveController(DFPIncompleteError, DFPTypeError) {
    /* eslint-disable dot-notation */
    /**
    * The size of the viewport.
    *
    * A `dfp-responsive` tag always has one fixed viewport width and height, and
    * then many possible ad sizes viable for ad calls for those viewport
    * dimensions.
    *
    * @type {!googletag.SingleSizeArray}
    */
    const viewportSize = Object.seal([
      this['viewportWidth'],
      this['viewportHeight'] || 0
    ]);
    /* eslint-enable dot-notation */

    /**
    * The ad sizes for the viewport dimensions.
    * @type {!googletag.MultiSize}
    */
    const adSizes = [];

    /**
    * Asserts if the state of the controller is valid.
    * @throws {DFPTypeError|DFPIncompleteError} If the directive is not complete.
    */
    this.checkValid = function() {
      ['viewportWidth', 'viewportHeight'].forEach(dimension => {
        const value = this[dimension];
        if (typeof value !== 'number') {
          dimension = dimension.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
          throw new DFPTypeError('dfp-responsive', dimension, value, 'number');
        }
      });

      if (adSizes.length === 0) {
        throw new DFPIncompleteError('dfp-responsive', 'dfp-size', false);
      }
    };

    /**
    * Adds an ad size to the responsive mapping.
    * @param {!googletag.SingleSize} size The ad size to add for the viewport size.
    */
    this.addSize = function(size) {
      adSizes.push(size);
    };

    /**
    * Retrieves the state of the controller.
    * @return {ResponsiveMapping} The state of the controller, for use by the directive.
    */
    this.getState = function() {
      this.checkValid();
      return Object.freeze({
        viewportSize,
        adSizes
      });
    };
  }

  DFPResponsiveController.$inject = ['$scope'];

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
      controller: [
        'DFPIncompleteError',
        'DFPTypeError',
        DFPResponsiveController
      ],
      controllerAs: 'controller',
      bindToController: true,
      link: dfpResponsiveDirective,
      // Need to quote props to avoid closure compiler renaming
      // eslint-disable-next-line quote-props
      scope: {'viewportWidth': '=', 'viewportHeight': '='}
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
