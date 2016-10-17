/**
* @file Defines the doubleClick service.
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
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// eslint-disable-next-line no-use-before-define, no-var
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

(function(module) {
  "use strict";

  class DFPConfigurationError extends Error {}

  /**
  * The URL to the GPT library we want to load asynchronously.
  */
  module.constant(
    'GPT_LIBRARY_URL',
    '//www.googletagservices.com/tag/js/gpt.js'
  );

  /**
  * The provider for the doubleClick service.
  *
  * The doubleClick service is responsible for main initial configuration
  * tasks, injecting the GPT library asynchronously and providing the `then`
  * proxy to `googletag.cmd.push`.
  *
  * @param {string} GPT_LIBRARY_URL The URL of the GPT library to inject.
  */
  function dfpProvider(GPT_LIBRARY_URL) {
    /**
    * The doubleClickProvider function.
    * @type {Function}
    * @constant
    */
    const self = this;

    /**
    * Whether to enable Single Request Architecture (SRA) mode.
    * @type {boolean}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSingleRequest}
    */
    self.enableSingleRequestArchitecture = true;

    /**
    * Whether to enable video ads.
    * @type {!boolean}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableVideoAds}
    */
    self.enableVideoAds = true;

    /**
    * Whether to collapse empty divs for which ad calls fail.
    * @type {boolean}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_collapseEmptyDivs}
    */
    self.collapseIfEmpty = true;

    /**
    * Whether to enable the initial load of ads.
    *
    * This is necessary if you want to be able to
    * manually refresh ads with refresh().
    *
    * @type {boolean}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_disableInitialLoad}
    */
    self.disableInitialLoad = true;

    /**
    * Whether to enable synchronous rendering.
    *
    * Rendering is asynchronous by default.
    * @type {boolean}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSyncRendering}
    */
    self.enableSyncRendering = false;

    /**
    * Enables ad centering instead of left-alignment.
    * @type {boolean}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_setCentering}
    */
    self.centering = false;

    /**
    * The location information to pass to DFP.
    *
    * This should either be an array of `[longitude, latitude [, radius]]`
    * numbers or a freefrom address string. You must enable usage of this
    * information in DFP.
    *
    * @type {?Array|String}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_setLocation}
    */
    self.location = null;

    /**
    * Your Publisher-Provided Identifier, if you have any.
    * @type {?String}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_setPublisherProvidedId}
    */
    self.ppid = null;

    /**
    * An optional object of global targeting key/values.
    *
    * These will apply to all ad slots.
    * The format should be `(key, value|[values])`.
    * @type {?Object}
    * @see [GPT Reference]{@link https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_setTargeting}
    */
    self.globalTargeting = null;

    /**
    * Whether all ad slots should force safe frame by default.
    * @type {boolean}
    */
    self.forceSafeFrame = false;

    /**
    * Optionally, configuration information for safe frames.
    *
    * @example
    * var config = {
    *   allowOverlayExpansion: true,
    *   allowPushExpansion: true,
    *   sandbox: true
    *};
    * @type {?Object}
    */
    self.safeFrameConfig = null;

    /**
    * Whether to download the GPT library.
    * @type {!boolean}
    */
    self.loadGPT = true;

    /**
    * Whether or not we have loaded the GPT library yet.
    * @type {!boolean}
    */
    let loaded = false;

    /**
    * Handles the safe-frame configuration.
    * @param {googletag.PubAdsService} pubads The googletag pubads service.
    */
    function addSafeFrameConfig(pubads) {
      if (!self.safeFrameConfig) return;
      if (typeof self.globalTargeting !== 'object') {
        throw new DFPConfigurationError('Targeting must be an object');
      }
      pubads.setSafeFrameConfig(self.safeFrameConfig);
    }

    /**
    * Handles the targeting configuration.
    * @param {googletag.PubAdsService} pubads The googletag pubads service.
    */
    function addTargeting(pubads) {
      if (!self.globalTargeting) return;
      if (typeof self.globalTargeting !== 'object') {
        throw new DFPConfigurationError('Targeting must be an object');
      }

      for (let key in self.globalTargeting) {
        if (self.globalTargeting.hasOwnProperty(key)) {
          pubads.setTargeting(key, self.globalTargeting[key]);
        }
      }
    }

    /**
    * Handles the location configuration.
    * @param {googletag.PubAdsService} pubads The googletag pubads service.
    */
    function addLocation(pubads) {
      if (!self.location) return;

      if (typeof self.location === 'string') {
        pubads.setLocation(self.location);
        return;
      }

      if (!Array.isArray(self.location)) {
        throw new DFPConfigurationError('Location must be an ' +
        'array or string');
      }

      pubads.setLocation.apply(pubads, self.location);
    }

    /**
    * Handles the ppid configuration.
    * @param {googletag.PubAdsService} pubads The googletag pubads service.
    */
    function addPPID(pubads) {
      if (!self.ppid) return;
      if (typeof self.ppid !== 'string') {
        throw new DFPConfigurationError('PPID must be a string');
      }

      pubads.setPublisherProvidedId(self.ppid);
    }

    // Fear not this syntax, my son!
    this.$get = ['scriptInjector', scriptInjector => {
      /**
      * Sets up the GPT and DFP services.
      */
      function setup() {
        const pubads = googletag.pubads();

        if (self.enableSingleRequestArchitecture) {
          pubads.enableSingleRequest();
        }

        if (self.enableVideoAds) {
          pubads.enableVideoAds();
        }

        if (self.collapseIfEmpty) {
          pubads.collapseEmptyDivs();
        }

        if (self.disableInitialLoad) {
          pubads.disableInitialLoad();
        }

        if (self.enableSyncRendering) {
          pubads.enableSyncRendering();
        }

        pubads.setForceSafeFrame(self.forceSafeFrame);
        pubads.setCentering(self.centering);

        addLocation(pubads);
        addPPID(pubads);
        addTargeting(pubads);
        addSafeFrameConfig(pubads);

        googletag.enableServices();
      }

      /**
     * The configuration function called to initialize the doubleClick service.
     */
      function dfp() {
        googletag.cmd.push(setup);

        if (self.loadGPT) {
          scriptInjector(GPT_LIBRARY_URL).then(() => {
            loaded = true;
          });
        }
      }

      /**
     * Tests if the GPT library has been injected yet.
     * @return {boolean} [description]
     */
      dfp.hasLoaded = function() {
        return loaded;
      };

      /**
     * Pushes a taks into GPT's asynchronous task queue.
     * @param  {Function} task The task function to execute in the queue.
     */
      dfp.then = function(task) {
        googletag.cmd.push(task);
      };

      return dfp;
    }];
  }

  module.provider('dfp', ['GPT_LIBRARY_URL', dfpProvider]);

// eslint-disable-next-line
})(angularDfp);
