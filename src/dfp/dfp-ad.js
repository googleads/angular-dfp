/**
* @file The primary directive for specifying an ad slot using the library.
*
* This directive is repsponsible for collecting all nested configuration options
* and ultimately making the ad call. All other tags in the library, except
* `dfp-video` and `dfp-audience-pixel` can and must be nested under this tag.
*
* @example <caption>Example usage of the `dfp-ad` directive.</caption>
* <dfp-ad force-safe-frame
*         collapse-if-empty
*         refresh='3s'
*         ad-unit="/path/to/my/ad-unit">
*   <dfp-size width="728" height="90"></dfp-size>
*   <dfp-targeting key="sport" value="football"></dfp-targeting>
*   <dfp-targeting key="food">
*     <dfp-value>chicken</dfp-value>
*     <dfp-value>meatballs</dfp-value>
*   </dfp-targeting>
*   <dfp-responsive browser-width="320" browser-height="0">
*     <dfp-size width=320 height=50></dfp-size>
*   </dfp-responsive>
* </dfp-ad>
*
* @module dfp-ad
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

// eslint-disable-next-line no-use-before-define, no-var
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

// eslint-disable-next-line valid-jsdoc
(/** @lends module:dfp-ad */ function(module) {
  'use strict';

  /**
  * The controller for the `dfp-ad` directive.
  * @private
  */
  function dfpAdController() {
    /**
    * The fixed (non-responsive) sizes for the ad slot.
    * @type {Array}
    */
    const sizes = [];

    /**
    * Any `{browserSize, adSizes}` objects to create responsive mappings.
    * @type {Array}
    */
    const responsiveMapping = [];

    /**
    * Any key/value targeting objects.
    * @type {Array}
    */
    const targetings = [];

    /**
    * Any category exclusion labels.
    * @type {Array}
    */
    const exclusions = [];

    /**
    * Any additional scripts to execute for the slot.
    * @type {Array}
    */
    const scripts = [];

    // TODO: Throw exceptions rather than asserting
    /**
    * Tests if the state of the directive is valid and complete.
    * @return {boolean} True if the ad slot may be created, else false.
    */
    this.isValid = function() {
      if (sizes.length === 0) return false;
      if (!this.adUnit) return false;
      return true;
    };

    /**
    * Returns the public state of the controller for use by the directive.
    * @return {Object} An object of all properties the directive will
    *                  need to create an ad slot.
    */
    this.getState = function() {
      console.assert(this.isValid());
      return Object.freeze({
        sizes,
        responsiveMapping,
        targetings,
        exclusions,
        adUnit: this.adUnit,
        forceSafeFrame: this.forceSafeFrame,
        safeFrameConfig: this.safeFrameConfig,
        clickUrl: this.clickUrl,
        refresh: this.refresh,
        scripts,
        collapseIfEmpty: this.collapseIfEmpty
      });
    };

    /**
    * Registers a (fixed) size for the ad slot.
    *
    * @param {Array} size A [width, height] array.
    * @see [Google DFP Support]{@link https://support.google.com/dfp_premium/answer/1697712?hl=en}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.defineSlot}
    */
    this.addSize = function(size) {
      sizes.push(size);
    };

    /**
    * Registers a responsive mapping for the ad slot.
    * @param {Object} mapping A `{browserSize, adSizes}` mapping.
    * @see [Google DFP Support]{@link https://support.google.com/dfp_premium/answer/3423562?hl=en}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.SizeMappingBuilder}
    */
    this.addResponsiveMapping = function(mapping) {
      responsiveMapping.push(mapping);
    };

    /**
    * Registers a targeting object for the ad slot.
    * @param {Object} targeting A {browserSize, adSizes} object.
    * @see [Google DFP Support]{@link https://support.google.com/dfp_premium/answer/177383?hl=en}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PassbackSlot_setTargeting}
    */
    this.addTargeting = function(targeting) {
      targetings.push(targeting);
    };

    /**
    * Registers a category exclusion for the slot.
    * @param {string} exclusion The category exclusion label.
    * @see [Google Developer Support]{@link https://support.google.com/dfp_premium/answer/3238504?hl=en&visit_id=1-636115253122574896-2326272409&rd=1}
    * @see [GPT Reference] {@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_setCategoryExclusion}
    */
    this.addExclusion = function(exclusion) {
      exclusions.push(exclusion);
    };

    /**
    * Registers a script for the slot.
    *
    * Scripts can be run during ad slot definition and before the actual ad
    * call, to perform any auxiliary configuration taks not handled by our
    * interface.
    *
    * @param {string} script The script string to be evaluated.
    */
    this.addScript = function(script) {
      scripts.push(script);
    };
  }

  /**
  * The directive for the `dfp-ad` tag.
  *
  * This is the primary directive used for defining ad slots. All other
  * directives, except `dfp-video`, are nested under this slot. It is
  * standalone except for the necessity of (at least) one nested `dfp-size`
  * directive.
  *
  * @private
  * @param {Object} scope          The Angular element scope.
  * @param {Object} element        The jQuery/jQlite element of the directive.
  * @param {Object} attributes     The attributes defined on the element.
  * @param {Object} controller     The `dfpAdController` object.
  * @param  {Function} $injector {@link http://docs.angularjs.org/api/ng.$injector}
  */
  function dfpAdDirective(scope, element, attributes, controller, $injector) {
    const dfp = $injector.get('dfp');
    const dfpIDGenerator = $injector.get('dfpIDGenerator');
    const dfpRefresh = $injector.get('dfpRefresh');
    const responsiveResize = $injector.get('responsiveResize');

    const ad = controller.getState();

    const jQueryElement = element;
    element = element[0];

      // Generate an ID or check for uniqueness of an existing one
    dfpIDGenerator(element);

    /**
    * Handles the responsive mapping (`sizeMapping`) building.
    * @param {googletag.Slot} slot The ad slot.
    */
    function addResponsiveMapping(slot) {
      if (ad.responsiveMapping.length === 0) return;

      const sizeMapping = googletag.sizeMapping();

      ad.responsiveMapping.forEach(function(mapping) {
        sizeMapping.addSize(mapping.browserSize, mapping.adSizes);
      });

      slot.defineSizeMapping(sizeMapping.build());
    }

    /**
    * Defines the ad slot, aggregating all nested directives.
    *
    * This function combines all the properties added by nested directives.
    * Recall, for this, that angular executes controllers on the way down the
    * DOM and directives on the way up. As such, this directive is executed
    * after all nested directives were been invoked (adding properties such as
    * sizes, responsive mappings or key/value pairs to the controller). The
    * full ad slot definition can then be sent into the `googletag` command
    * queue to fetch an ad from the DoubleClick ad network.
    */
    function defineSlot() {
      const slot = googletag.defineSlot(ad.adUnit, ad.sizes, element.id);

      if (ad.forceSafeFrame !== undefined) {
        slot.setForceSafeFrame(true);
      }

      if (ad.clickUrl) {
        slot.setClickUrl(ad.clickUrl);
      }

      if (ad.collapseIfEmpty !== undefined) {
        slot.setCollapseEmptyDiv(true, true);
      }

      if (ad.safeFrameConfig !== undefined) {
        slot.setSafeFrameConfig(JSON.parse(ad.safeFrameConfig));
      }

      addResponsiveMapping(slot);

      ad.targetings.forEach(targeting => {
        slot.setTargeting(targeting.key, targeting.values);
      });

      ad.exclusions.forEach(exclusion => {
        slot.setCategoryExclusion(exclusion);
      });

      ad.scripts.forEach(script => { script(slot); });

      slot.addService(googletag.pubads());

      // When initialLoad is disabled, display()
      // will only register the slot as ready, but not actually
      // fetch an ad for it yet. This is done via refresh().
      googletag.display(element.id);

      // Send to the refresh proxy
      dfpRefresh(slot, ad.refresh).then(() => {
        if (ad.responsiveMapping.length > 0) {
          responsiveResize(jQueryElement);
        }
      });
    }

    // Push the ad slot definition into the command queue.
    dfp.then(defineSlot);
  }

  module.directive('dfpAd', ['$injector', function($injector) {
    return {
      restrict: 'AE',
      controller: dfpAdController,
      controllerAs: 'controller',
      bindToController: true,
      link: function(...args) {
        dfpAdDirective.apply(null, args.slice(0, 4).concat($injector));
      },
      scope: {
        adUnit: '@',
        clickUrl: '@',
        forceSafeFrame: '@',
        safeFrameConfig: '@',
        refresh: '@',
        collapseIfEmpty: '@'
      }
    };
  }
  ]);

// eslint-disable-next-line
})(angularDfp);
