/**
 * @file An ID generating service.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

(function(module) {
  /**
   * [dfpIDGeneratorFactory description]
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
     * @return {Number} The unique numeric ID.
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
     * @return {Number} The unique ID of the element, or a new generated one.
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
     * @param  {Number} id The ID to test.
     * @return {boolean} True if the ID is not unique, else false.
     * @see dfpIDGenerator.isUnique()
     */
    dfpIDGenerator.isTaken = function(id) {
      return id in generatedIDs;
    };

    /**
     * Tests if an ID is unique (not taken).
     * @param  {Number} id The ID to test.
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
