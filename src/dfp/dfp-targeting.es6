/**
 * @file Defines the controller and directive for the dfp-targeting tag.
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

(function(module) {
  /**
   * The controller for DFP targeting (key-value) directives.
   *
   * This controller makes an `addValue` function available that allows the
   * `dfp-value` directive to add values for a single key attribute defined in
   * the directive.
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
      bindToController: true,
      scope: {key: '@', value: '@'},
      link: dfpTargetingDirective
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
