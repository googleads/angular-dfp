/**
 * @file
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

let angularDfp = (function(module) {
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
})(angularDfp || angular.module('angularDfp'));
