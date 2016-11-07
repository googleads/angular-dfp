/**
* @module script-injector
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
(/** @lends module:script-injector */ function(module) {
  'use strict';

  /**
  * The factory for the `scriptInjector` service.
  *
  * @private
  * @param {!angular.$q} $q The Angular `$q` service.
  * @param {Function} httpError The `httpError` service.
  * @return {Function} The `scriptInjector` service.
  */
  function scriptInjectorFactory($q, httpError) {
    /**
    * Creates an HTML script tag.
    * @param  {!string} url The string of the script to inject.
    * @return {Element} An `Element` ready for injection.
    */
    function createScript(url) {
      const script = document.createElement('script');
      const ssl = document.location.protocol === 'https:';

      script.async = 'async';
      script.type = 'text/javascript';
      script.src = (ssl ? 'https:' : 'http:') + url;

      return script;
    }

    /**
    * Creates a promise, to be resolved after the script is loaded.
    * @param  {Element} script The script tag.
    * @param {!string} url The url of the request.
    * @return {angular.$q.Promise<null>} The promise for the asynchronous script injection.
    */
    function promiseScript(script, url) {
      const deferred = $q.defer();

      /**
      * Resolves the promise.
      */
      function resolve() {
        deferred.resolve();
      }

      /**
      * Rejects the promise for a given faulty response.
      * @param  {?Object} response The response object.
      */
      function reject(response) {
        response = response || {status: 400};
        httpError(response, 'loading script "{0}".', url);

        // Reject the promise and pass the reponse
        // object to the error callback (if any)
        deferred.reject(response);
      }

      // IE
      script.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (httpError.isErrorCode(this.status)) {
            reject(this);
          } else {
            resolve();
          }
        }
      };

      // Other viewports
      script.onload = resolve;
      script.onerror = reject;

      return deferred.promise;
    }

    /**
    * Injects a script tag into the DOM (at the end of <head>).
    * @param  {Element} script The Element script.
    */
    function injectScript(script) {
      const head = document.head || document.querySelector('head');
      head.appendChild(script);
    }

    /**
    * The `scriptInjector` service.
    * @param  {!string} url The string to inject.
    * @return {angular.$q.Promise<null>} A promise, resolved after
    *                   loading the script or reject on error.
    */
    function scriptInjector(url) {
      const script = createScript(url);
      injectScript(script);
      return promiseScript(script, url);
    }

    return scriptInjector;
  }

  module.factory('scriptInjector', ['$q', 'httpError', scriptInjectorFactory]);

// eslint-disable-next-line
})(angularDfp);
