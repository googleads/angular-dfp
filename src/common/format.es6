/**
 * @file
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
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function(module) {
   /**
    * Formats a string similar to str.format in Python.
    *
    * For a string '{0} {1} {2}', the function will replace each placeholder with
    * the argument at the given index (after the format string itself).
    *
    * @param  {string} string The format string.
    * @return {string} The formatted string.
    */
  function dfpFormat(string) {
     // Grab all arguments passed the first
    const args = Array.prototype.slice.call(arguments, 1);

     // Check if we still have arguments we can replace with,
     // else just return the un-formatted string
    return string.replace(/{(\d+)}/g, function(match, index) {
      return index < args.length ? args[index] : match;
    });
  }

  module.factory('dfpFormat', [function() {
    return dfpFormat;
  }]);
// eslint-disable-next-line
})(angularDfp);
