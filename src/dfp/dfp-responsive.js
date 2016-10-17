/**
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
