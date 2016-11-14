/**
* @module dfp-incomplete-error
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
(/** @lends module:dfp-incomplete-error */ function(module) {
  'use strict';

  /**
  * Factory for the DFPIncompleteError service.
  * @return {Function} The DFPIncompleteError service.
  */
  function dfpIncompleteErrorFactory() {
    class DFPIncompleteError extends Error {
      constructor(directiveName, missingName, isAttribute) {
        super(
          `Incomplete definition of '${directiveName}': ` +
          `Missing ${isAttribute ? 'attribute' : 'child directive'} ` +
          `'${missingName}'.`
        );
      }
    }

    return DFPIncompleteError;
  }

  /**
  * Factory for the DFPTypeError service.
  * @return {Function} The DFPTypeError service.
  */
  function dfpTypeErrorFactory() {
    class DFPTypeError extends Error {
      constructor(directiveName, attributeName, wrongValue, expectedType) {
        super(
          `Wrong type for attribute '${attributeName}' on ` +
          `directive '${directiveName}': Expected ${expectedType}` +
          `, got ${typeof wrongValue}`
        );
      }
    }

    return DFPTypeError;
  }
  /**
  * Factory for the DFPMissingParentError service.
  * @return {Function} The DFPMissingParentError service.
  */
  function dfpMissingParentErrorFactory() {
    class DFPMissingParentError extends Error {
      constructor(directiveName, ...parents) {
        console.assert(parents && parents.length > 0);
        if (Array.isArray(parents[0])) {
          parents = parents[0];
        }

        let parentMessage;
        if (parents.length > 1) {
          parents = parents.map(p => `'${p}'`);
          parentMessage = ', which must be ';
          parentMessage += parents.slice(0, -1).join(', ');
          parentMessage += ` or ${parents[parents.length - 1]}`;
        } else {
          parentMessage = ` '${parents[0]}'`;
        }

        super(
          `Invalid use of '${directiveName}' directive. ` +
          `Missing parent directive${parentMessage}.`
        );
      }
    }

    return DFPMissingParentError;
  }

  module.factory('DFPIncompleteError', dfpIncompleteErrorFactory);
  module.factory('DFPTypeError', dfpTypeErrorFactory);
  module.factory('DFPMissingParentError', dfpMissingParentErrorFactory);

// eslint-disable-next-line
})(angularDfp);
