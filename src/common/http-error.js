/**
* @module http-error
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
(/** @lends module:http-error */ function(module) {
  'use strict';

  /**
 * The factory for the `httpError` service.
 *
 * @private
 * @param  {Function} $log    The Angular `$log` service.
 * @return {Function} The `httpError` service.
 */
  function httpErrorFactory($log) {
    /**
   * The `httpError` service.
   * @param  {!Object} response An XHR response object.
   * @param  {!string} message The error message to show.
   */
    function httpError(response, message) {
      $log.error(`Error (${response.status})`);
    }

    /**
    * Tests if a given HTTP response status is an error code.
    * @param  {Number|!String}  code The response status code.
    * @return {!Boolean} True if the code is an error code, else false.
    */
    httpError.isErrorCode = function(code) {
      if (typeof code === 'number') {
        return !(code >= 200 && code < 300);
      }

      console.assert(typeof code === 'string');

      return code[0] !== '2';
    };

    return httpError;
  }

  module.factory('httpError', ['$log', httpErrorFactory]);

  // eslint-disable-next-line
})(angularDfp);
