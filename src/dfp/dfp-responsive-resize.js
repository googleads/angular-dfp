/**
* @module responsive-resize
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
(/** @lends module:responsive-resize */ function(module) {
  'use strict';

  /**
  * The factory of the `responsiveResize` service.
  *
  * The `responsiveResize` service ensures that ads with responsive mappings
  * defined always have iframes that fit their ad's dimensions and not their
  * containers' width. This ensures that centering ads, which is essential to
  * responsive ads, works well.
  *
  * @private
  */
  function dfpResponsiveResizeProvider() {
    /**
    * Reference to tthe responsiveResizeProvider.
    * @type {Function}
    */
    const self = this;

    /**
    * The delay after which to make an ad call once a resize was registered.
    *
    * Once a resize is registered, the `refreshing` CSS class is added to the
    * ad's container and only after this delay the actual refresh call is made.
    * This allows certain animations to take place. For example, you could
    * have an opacity of 0 in the `refreshing` class and fade out the ad.
    *
    * The value of this variable may be anything understood by parseDuration.
    * @type {!number|!string}
    */
    self.refreshDelay = 200;

    this.$get = [
      '$interval',
      '$timeout',
      '$window',
      'dfpRefresh',
      'parseDuration',
      function($interval, $timeout, $window, dfpRefresh, parseDuration) {
        // Turn into jQLite element
        // eslint-disable-next-line
        $window = angular.element($window);

        // If a duration expression was passed (e.g. '2s'), then parse it
        self.refreshDelay = parseDuration(self.refreshDelay);

        /**
        * The `responsiveResize` service.
        * @param  {!angular.JQLite} element The element to make responsive.
        * @param {!googletag.Slot} slot The ad slot to refresh responsively.
        * @param  {!Array<!ViewportDimensions>} dimensions The viewport dimensions at which to refresh.
        */
        function responsiveResize(element, slot, dimensions) {
          // Sort the dimensions first by width, then (on equality) by height
          dimensions.sort((first, second) => {
            if (first.width < second.width) return -1;
            if (first.width > second.width) return +1;

            // Else width is equal, so compare by height
            if (first.height < second.height) return -1;
            if (first.height > second.height) return +1;

            // Width and height are equal
            return 0;
          });

          /**
          * The interval for polling changes in the iframe's dimensions.
          * @type {number}
          * @constant
          */
          const POLL_INTERVAL = 100; // 100ms

          /**
          * How long we poll (at the rate of POLL_INTERVAL).
          * @type {number}
          * @constant
          */
          const POLL_DURATION = 2500; // 2.5s

          /**
          * Retrieves the iframe of the ad of the element.
          * @return {angular.JQLite} An iframe HTML element.
          */
          function queryIFrame() {
            return element.find('div iframe');
          }

          /**
          * Normalized the iframe dimensions.
          *
          * This operation here is the main goal of this service. To ensure that the
          * responsive ad can always be centered, it must have width and height
          * matching its content. However, upon new ad loads, it may happen that
          * even though the iframe width and height*attributes* change, the CSS
          * dimensions remain unchanged. This distorts the element. As such, we
          * simply normalize these two dimensionss here.
          *
          * @param  {angular.JQLite=} iframe Optionally, the iframe to normalize
          *                           (else it is queried).
          */
          function normalizeIFrame(iframe) {
            iframe = iframe || queryIFrame();
            iframe.css('width', iframe.attr('width') + 'px');
            iframe.css('height', iframe.attr('height') + 'px');
          }

          /**
          * Polls for a change in the dimensions of the
          * iframe and normalizes if a change was detected.
          * @param  {!Object} initial The initial dimensions against
          *                          which to compare.
          */
          function pollForChange(initial) {
            // The iframe element may change between calls
            const iframe = queryIFrame();

            const change = ['width', 'height'].some(dimension => {
              return iframe.attr(dimension) !== initial[dimension];
            });

            if (change) {
              normalizeIFrame(iframe);
              element.parent().removeClass('refreshing');
            }
          }

          /**
          * Starts polling for changes in the ad's dimensions.
          * @param  {!Object} initial The initial dimensions against
          *                          which to compare.
          */
          function startPolling(initial) {
            // Poll for a change every `POLL_INTERVAL` milliseconds
            const poll = $interval(() => pollForChange(initial), POLL_INTERVAL);

            // Stop polling after `POLL_DURATION`
            $timeout(() => $interval.cancel(poll), POLL_DURATION);
          }

          /**
          * @return {!{width: ?string, height: ?string}} The initial width of the iframe.
          */
          function getIframeDimensions() {
            const iframe = queryIFrame();
            const dimensions = [iframe.css('width'), iframe.css('height')];

            // Slice away the 'px' at the end, if set
            let plain = dimensions.map(dimension => {
              return dimension ? dimension.slice(0, -2) : null;
            });

            return {width: plain[0], height: plain[1]};
          }

          /**
          * Sets up the watching mechanisms for the responsive resizing.
          */
          function watchResize() {
            // The goal is to have the iFrame's width and height style (CSS)
            // properties match the width and height attributes, which are set by
            // DFP are thus the correct dimensions. However, the behavior here is
            // quite undeterministic and difficult to predict in terms of what
            // events trigger a change in size and when this happens. As such, the
            // best strategy I found was to periodically poll for any changes in the
            // width and height attributes for the first second, every 100ms. After
            // that any changes to the dimensions of the iframe should have been
            // captured and digested. Since changes to these dimensions will only
            // happen after a request, it is also not necessary to setup a resize
            // watch.
            startPolling(getIframeDimensions());

            // An additional resize listener helps for tricky cases
            // eslint-disable-next-line no-undef
            $window.on('resize', () => { normalizeIFrame(); });
          }

          /**
          * Returns a function suitable for responsive resize-event watching.
          * @return {Function} A function to pass as an event
          *                    listener for (window) resize events.
          */
          function makeResponsive() {
            /**
            * Determines in which of the boundaries the element is.
            *
            * Linear searches because there will never be many entries. Else do an
            * equal-range lower bound search to find the floor (largest value that
            * is less * than or equal) of the viewport width, then an upper bound
            * binary search for * the equal range, then a floor search for the
            * height. O(3 * lg N) but overkill here.
            * @return {number} The current index.
            */
            function determineIndex() {
              const width = window.innerWidth;
              const height = window.innerHeight;
              const numberOfDimensions = dimensions.length;

              let index = 1;
              for (; index < numberOfDimensions; ++index) {
                if (width < dimensions[index].width) break;
                if (height < dimensions[index].height) break;
              }

              // Returns the index that was still valid
              return index - 1;
            }

            /**
            * The index corresponding to the current boundaries of the element.
            * @type {number}
            */
            let index = determineIndex();

            /**
            * Tests if the element could grow in size.
            *
            * An element can grow if it's not yet maximally sized and
            * its width is at least as big as that of the next boundary.
            * @return {boolean} True if the index should be
            *                   incremented by one, else false.
            */
            function couldGrow() {
              if (index + 1 >= dimensions.length) return false;
              if (window.innerWidth < dimensions[index + 1].width) {
                return false;
              }
              if (window.innerHeight < dimensions[index + 1].height) {
                return false;
              }

              return true;
            }

            /**
            * Tests if the element could shrink in size.
            *
            * An element can grow if it's not yet minimally sized and
            * its width is less than the current boundary.
            * @return {boolean} True if the index should be
            *                   decremented by one, else false.
            */
            function couldShrink() {
              if (index === 0) return false;
              if (window.innerWidth < dimensions[index].width) return true;
              if (window.innerHeight < dimensions[index].height) return true;
              return false;
            }

            /**
            * Refreshes the ad slot.
            */
            function refresh() {
              dfpRefresh(slot).then(() => {
                watchResize();
              });
            }

            /**
            * Performs a size transition.
            * @param  {number} delta The delta by which to change the index.
            */
            function transition(delta) {
              console.assert(index >= 0 && index < dimensions.length);
              console.assert(delta === -1 || delta === +1);

              index += delta;

              // Add this class so the user can add styling while
              // the ad is refreshing and the iframe resizes
              element.parent().addClass('refreshing');

              // Refresh the ad slot now
              $timeout(refresh, self.refreshDelay);

              console.assert(index >= 0 && index < dimensions.length);
            }

            // Resize initially
            watchResize();

            return function watchListener() {
              if (couldGrow()) {
                transition(+1);
              } else if (couldShrink()) {
                transition(-1);
              }
            };
          }

          $window.on('resize', makeResponsive());
        }

        return responsiveResize;
      }];
  }

  module.provider('dfpResponsiveResize', dfpResponsiveResizeProvider);

    // eslint-disable-next-line
  })(angularDfp);
