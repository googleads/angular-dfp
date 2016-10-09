/**
 * @file
 * @author Peter Goldsborough <peter@goldsborough.me>
 * @license MIT
 */

(function(module) {
  /**
   * The controller for the `dfp-responsive` directive.
   */
  function DFPResponsiveController() {
    /**
     * The size of the browser.
     *
     * A `dfp-responsive` tag always has one fixed browser width and height, and
     * then many possible ad sizes viable for ad calls for those browser
     * dimensions.
     *
     * @type {Array}
     */
    const browserSize = Object.seal([this.browserWidth, this.browserHeight]);

    /**
     * The ad sizes for the browser dimensions.
     * @type {Array}
     */
    const adSizes = [];

    /**
     * Asserts if the state of the controller is valid.
     * @return {!boolean} True if the state of the controller is
     *                   ready to be fetched, else false.
     */
    function isValid() {
      return adSizes.length > 0;
    }

    /**
     * Adds an ad size to the responsive mapping.
     * @param {Array} size A `[width, height]` array to add.
     */
    this.addSize = function(size) {
      adSizes.push(size);
    };

    /**
     * Retrieves the state of the controller.
     * @return {Object} The state of the controller, for use by the directive.
     */
    this.getState = function() {
      console.assert(isValid());
      return Object.freeze({
        browserSize: browserSize,
        adSizes: adSizes
      });
    };
  }

  /**
   * The directive for the responsive mapping.
   * @param {Object} scope The angular scope.
   * @param {Object} element The HTML element on which the directive is defined.
   * @param {Object} attributes The attributes of the element.
   * @param {Object} ad The parent `dfp-ad` controller.
   */
  function dfpResponsiveDirective(scope, element, attributes, ad) {
    const mapping = scope.controller.getState();
    ad.addResponsiveMapping(mapping);
  }

  module.directive('dfpResponsive', [function() {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      controller: DFPResponsiveController,
      bindToController: true,
      link: dfpResponsiveDirective,
      scope: {browserWidth: '=', browserHeight: '='}
    };
  }]);

// eslint-disable-next-line
})(angularDfp);
