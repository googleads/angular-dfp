/**
* @file A directive for specifying DFP key/value targeting.
*
* DFP has a concept of "key/values" to allow targeting of ads against slots that
* have certain values for certain keys. This directive enables adding one or
* more such key/value pairs for an ad slot.
*
* The `dfp-targeting` directive must nested in a `dfp-ad` tag. It may then be
* used either by directly passing a `key` and a `value` via attributes, or
* alternatively by specifying only a `key` attribute and adding values via
* nested `dfp-value` tags.
*
* @example
* <dfp-ad ad-unit="/35096353/pub-showcase">
*   <dfp-targeting key="sport" value="quidditch"></dfp-targeting>
*   <dfp-targeting key="food">
*     <dfp-value>chicken</dfp-value>
*     <dfp-value>meatballs</dfp-value>
*   </dfp-targeting>
* </dfp-ad>
*
* @module dfp-targeting
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
(/** @lends module:dfp-targeting */ function(module) {
  'use strict';

  /**
  * The controller for DFP targeting (key-value) directives.
  *
  * This controller makes an `addValue` function available that allows the
  * `dfp-value` directive to add values for a single key attribute defined in
  * the directive.
  * @private
  */
  function dfpTargetingController() {
    /**
    * The values of the targeting.
    * @type {Array}
    */
    const values = this.value ? [this.value] : [];

    /**
    * Verifies that the controller has a complete (valid) state.
    * @return {!boolean} True if the directive has all required members,
    *                   else false.
    */
    this.isValid = function() {
      if (!('key' in this)) return false;
      if (values.length === 0) return false;
      return true;
    };

    /**
    * Retrieves the public state of the controller for use by the directive.
    * @return {Object} The key and an array of values for the targeting.
    */
    this.getState = function() {
      console.assert(this.isValid());
      return Object.freeze({
        key: this.key,
        values: values
      });
    };

    /**
    * Adds a value for the key of the targeting.
    * @param {string} value The value to add for the key.
    */
    this.addValue = function(value) {
      values.push(value);
    };
  }

  /**
  * The directive for `dfp-targeting` tags.
  *
  * This directive requires to be nested in a `dfp-ad` tag. It may then be
  * used either by directly passing a `key` and a `value` via attributes, or
  * alternatively by specifying only a key and adding values via nested
  * `dfp-value` tags.
  *
  * @private
  * @param {Object} scope The angular scope.
  * @param {Object} element The HTML element on which the directive is defined.
  * @param {Object} attributes The attributes of the element.
  * @param {Object} ad The parent `dfp-ad` controller.
  */
  function dfpTargetingDirective(scope, element, attributes, ad) {
    console.assert(ad !== undefined);

    // Retrieve the state from the controller and add it to the parent
    const targeting = scope.controller.getState();
    ad.addTargeting(targeting);
  }

  module.directive('dfpTargeting', [function() {
    return {
      restrict: 'E',
      require: '^^dfpAd', // require dfp-ad as parent
      controller: dfpTargetingController,
      controllerAs: 'controller',
      bindToController: true,
      scope: {key: '@', value: '@'},
      link: dfpTargetingDirective
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
