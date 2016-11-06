/**
 * @module dfp-id-generator
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
(/** @lends module:dfp-id-generator */ function(module) {
  'use strict';

  /**
  * Returns the `dfpIDGenerator` service.
  *
  * @private
  * @return {Function} The dfpIDGenerator service.
  */
  function dfpIDGeneratorFactory() {
    /**
    * The hash of IDs generated so far.
    * @type {Object}
    */
    const generatedIDs = {};

    /**
    * Generates random IDs until unique one is found.
    * @return {string} The unique ID.
    */
    function generateID() {
      let id = null;

      do {
        const number = Math.random().toString().slice(2);
        id = 'gpt-ad-' + number;
      } while (id in generatedIDs);

      generatedIDs[id] = true;

      return id;
    }

    /**
    * The ID generator service.
    *
    * If the element passed has an ID already defined, it's uniqueness will be
    * checked. If it is not unique or not set at all, a new unique, random ID
    * is generated for the element.
    *
    * @param {Object} element The element whose ID to check or assign.
    * @return {string} The unique ID of the element, or a new generated one.
    */
    function dfpIDGenerator(element) {
      if (element && element.id && !(element.id in generatedIDs)) {
        return element.id;
      }

      const id = generateID();
      if (element) element.id = id;

      return id;
    }

    /**
    * Tests if an ID is taken.
    * @param  {number} id The ID to test.
    * @return {boolean} True if the ID is not unique, else false.
    * @see dfpIDGenerator.isUnique()
    */
    dfpIDGenerator.isTaken = function(id) {
      return id in generatedIDs;
    };

    /**
    * Tests if an ID is unique (not taken).
    * @param  {number} id The ID to test.
    * @return {boolean} True if the ID is unique, else false.
    * @see dfpIDGenerator.isTaken()
    */
    dfpIDGenerator.isUnique = function(id) {
      return !dfpIDGenerator.isTaken(id);
    };

    return dfpIDGenerator;
  }

  module.factory('dfpIDGenerator', [dfpIDGeneratorFactory]);

// eslint-disable-next-line
})(angularDfp);
