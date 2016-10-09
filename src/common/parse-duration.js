/**
 * @file Defines the `dfpParseDuration` service.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

let angularDfp = (function(module) {
  /**
   * An error thrown by the `dfpParseDuration` service.
   */
  class DFPDurationError extends Error {
    constructor(interval) {
      super("Invalid interval: '" + interval + "'");
    }
  }

  /**
   * A factory for the `dfpParseDuration` service.
   *
   * This service allows parsing of strings specifying
   * durations, such as '2s' or '5min'.
   *
   * @param {function} format The `format` service.
   * @return {function} The `dfpParseDuration` service.
   */
  function dfpParseDurationFactory(format) {
    /**
     * Converts a given time in a given unit to milliseconds.
     * @param  {number} time A time number in a certain unit.
     * @param  {string} unit A string describing the unit (ms|s|min|h).
     * @return {number} The time, in milliseconds.
     */
    function convertToMilliseconds(time, unit) {
      console.assert(/^(m?s|min|h)$/g.test(unit));

      if (unit === 'ms') return time;
      if (unit === 's') return time * 1000;
      if (unit === 'min') return time * 60 * 1000;
      if (unit === 'h') return time * 60 * 60 * 1000;
    }

    /**
     * Converts a regular expression match into a duration.
     * @param  {RegExp} match A regular expression match object.
     * @return {number} The converted milliseconds.
     */
    function convert(match) {
      const time = parseInt(match[1], 10);

       // No unit means milliseconds
       // Note: match[0] is the entire matched string
      if (match.length === 2) return time;

      return convertToMilliseconds(time, match[2]);
    }

    /**
     * Given an interval string, returns the corresponding milliseconds.
     * @param  {string} interval The string to parse.
     * @return {number} The corresponding number of milliseconds.
     */
    function dfpParseDuration(interval) {
      if (typeof interval === 'number') {
        return interval;
      }

      if (typeof interval !== 'string') {
        throw new TypeError(
          format("'{0}' must be of number or string type", interval)
        );
      }

       // Convert any allowed time format into milliseconds
      const match = interval.match(/(\d+)(m?s|min|h)?/);

      if (!match) {
        throw new DFPDurationError(interval);
      }

      return convert(match);
    }

    return dfpParseDuration;
  }

  module.factory('dfpParseDuration', ['dfpFormat', dfpParseDurationFactory]);

// eslint-disable-next-line
})(angularDfp || angular.module('angularDfp'));
