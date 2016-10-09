/**
* @file Defines the `scriptInjector` service.
* @author Peter Goldsborough <peter@goldsborough.me>
* @license MIT
*/

(function(module) {
  'use strict';

  /**
  * The factory for the `httpError` service.
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
