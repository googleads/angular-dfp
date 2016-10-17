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
  /**
  * An error thrown by the `dfpRefresh` service.
  */
  class DFPRefreshError extends Error {}

  /**
 * The core unit handling refresh calls to DFP.
 *
 * This provider exposes the `dfpRefresh` function, which, at the simplest, is
 * simply a proxy for `googletag.pubads().refresh()` and allows for dynamic ad
 * calls. However, do note that is has more complex refreshing functionality
 * built in, such as being able to buffer refresh calls and flush at certain
 * intervals, or have refresh call "barriers" (a fixed number of calls to wait
 * for) and global refresh intervals.
 */
  function dfpRefreshProvider() {
      // Store reference
    const self = this;

    /**
    * The milliseconds to wait after receiving a refresh request
    * to see if more requests come that we can buffer.
    * @type {Number}
    */
    self.bufferInterval = 1000;

    /**
   * The current limit of requests to buffer before sending a request.
   * If a proxy timeout is set and times out but the amount has not
   * yet been reached, the timeout will*not* be respected. That is,
   * setting a barrier temporarily (disables) the timeout.
   * @type {Number}
   */
    self.bufferBarrier = null;

    /**
   * If true, disables any barrier set once it was reached and re-enables
   * any timeout. If false, the barrier must be manually
   * disables via clearBarrier().
   * @type {boolean}
   */
    self.oneShotBarrier = true;

    /**
   * The interval after which*all* ads on the page are refreshed.
   * @type {number}
   * @default 1 hour.
   */
    self.refreshInterval = 60 * 60 * 1000; // 60 minutes* 60 seconds* 1000ms

    /**
    * Dynamic weighting to prioritize certain
    * refresh mechanisms over others.
    * @type {Object}
    */
    self.priority = {
      REFRESH: 1,
      INTERVAL: 1,
      BARRIER: 1
    };

    self.$get = [
      '$rootScope',
      '$interval',
      '$q',
      'parseDuration',
      function($rootScope, $interval, $q, parseDuration) {
        /**
        * The possible buffering/refreshing options
        * @type {!Object}
        */
        const Options = Object.freeze({
          REFRESH: 'REFRESH',
          INTERVAL: 'INTERVAL',
          BARRIER: 'BARRIER'
        });

        dfpRefresh.Options = Options;

        /**
        * The buffered ads waiting to be refreshed.
        * @type {Array}
        */
        let buffer = [];

        /**
        * Need to store all intervals because any interval created
        * using $interval must explicitly be destroyed, and to enable
        * stopping a refresh.
        * @type {Object}
        */
        const intervals = {refresh: null, buffer: null};

        /**
        * Stores the activity status of the buffering/refreshing options.
        * @type {Object}
        */
        const isEnabled = Object.seal({
          refresh: self.refreshInterval !== null,
          interval: self.bufferInterval !== null,
          barrier: self.bufferBarrier !== null
        });

        /**
        * The main interfacing function to the `dfpRefresh` proxy.
        *
        * Depending on the buffering configuration currently in place, the slot
        * passed may be buffered until either a barrier is reached or the
        * buffering interval elapses. If no buffering is set, the slot is
        * refreshed immediately.
        *
        * @param  {googletag.Slot} slot  The adslot to refresh.
        * @param  {string|number=} interval The interval at which to refresh.
        * @param  {!boolean=} defer If an interval is passed and defer is false, a regular refresh call will be made immediately.
        * @return {promise} A promise, resolved after the refresh call.
        */
        function dfpRefresh(slot, interval, defer) {
          const deferred = $q.defer();
          const task = {slot: slot, deferred: deferred};

          if (interval) {
            addSlotInterval(task, interval);
          }

          if (!interval || !defer) {
            scheduleRefresh(task);
          }

          return deferred.promise;
        }

        /**
        * Cancels an interval set for a certain ad slot.
        * @param  {googletag.Slot} slot The ad slot to cancel the interval for.
        * @throws DFPRefreshError When the given slot has not interval associated.
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.cancelInterval = function(slot) {
          if (!dfpRefresh.hasSlotInterval(slot)) {
            throw new DFPRefreshError("No interval for given slot");
          }

          $interval.cancel(intervals[slot]);
          delete intervals[slot];

          return dfpRefresh;
        };

        /**
        * Tests if the given slot has an interval set.
        * @param  {googletag.Slot}  slot The slot to check.
        * @return {!boolean} True if an interval is set for the slot, else false.
        */
        dfpRefresh.hasSlotInterval = function(slot) {
          return slot in self.intervals;
        };

        /**
        * Sets a new value for the buffer interval.
        *
        * The buffer interval is the interval at which
        * the proxy buffer is flushed.
        *
        * @param {string|number} interval An interval string or number
        *                                 (asis valid for `parseDuration`).
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.setBufferInterval = function(interval) {
          self.bufferInterval = parseDuration(interval);
          prioritize();

          return dfpRefresh;
        };

        /**
        * Clears any interval set for the buffering mechanism.
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.clearBufferInterval = function() {
          if (!dfpRefresh.hasBufferInterval()) {
            console.warn("clearBufferInterval had no " +
                         "effect because no interval was set.");
            return dfpRefresh;
          }

          disableBufferInterval();
          self.bufferInterval = null;

          prioritize();

          return dfpRefresh;
        };

        /**
        * Tests if currently any buffering interval is set.
        *
        * Note that even if a buffering interval is set, it may not currently
        * be active when also a barrier or global refresh interval with a
        * higher priority is active. This method will return true if
        * `setBufferInterval()` was ever called or a value was assigned to the
        * buffer interval property during configuration.
        *
        * @return {boolean} True if a buffer interval exists.
        ** @see dfpRefresh.bufferIntervalIsEnabled
        */
        dfpRefresh.hasBufferInterval = function() {
          return self.bufferInterval !== null;
        };

        /**
        * Tests if the buffer interval is currently*enabled*.
        *
        * Even if the service has a buffer interval configured, it may not be
        * currently enabled due to a lower priority setting relative to other
        * buffering/refreshing mechanisms.
        *
        * @return {boolean} True if the buffering interval is enabled, else false.
        * @see dfpRefresh.hasBufferInterval
        */
        dfpRefresh.bufferIntervalIsEnabled = function() {
          return isEnabled.interval;
        };

        /**
        * Returns the buffer interval setting (may be null).
        * @return {Number} The current buffer interval (in ms), if any.
        */
        dfpRefresh.getBufferInterval = function() {
          return self.bufferInterval;
        };

        /**
        * Sets a buffer barrier.
        *
        * A barrier is a number of refresh calls to wait before actually
        * performing a single refresh. I.e. it is the minimum buffer capacity
        * at which a refresh call is made. This is useful if you know that a
        * certain number of independent (that is, uncoordindated) refresh calls
        * will be made in a certain unit of time and you wish to wait for all
        * of them to arrive before calling new ads for all of them. For
        * example, you may have infinite scroll enabled and know that with
        * every new content fetch 3 ads come. Then you can pass the number 3 to
        * this method and the service will wait for 3 refresh calls before
        * actually refreshing them.
        *
        * @param {Number} numberOfAds The number of ads to wait for.
        * @param {Boolean=} oneShot     Whether to uninstall the barrier after the first flush.
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.setBufferBarrier = function(numberOfAds, oneShot) {
          self.bufferBarrier = numberOfAds;
          self.oneShotBarrier = (oneShot === undefined) ? true : oneShot;
          prioritize();

          return dfpRefresh;
        };

        /**
        * Clears any buffer barrier set.
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.clearBufferBarrier = function() {
          if (!dfpRefresh.hasBufferBarrier()) {
            console.warn("clearBufferBarrier had not effect because " +
                         "no barrier was set.");
            return dfpRefresh;
          }

          self.bufferBarrier = null;
          prioritize();

          return dfpRefresh;
        };

        /**
        * Returns the any buffer barrier set.
        * @return {Number} The current barrier
        *                  (number of ads to buffer before flushing).
        */
        dfpRefresh.getBufferBarrier = function() {
          return self.bufferBarrier;
        };

        /**
        * Tests if any buffer barrier is set.
        *
        * Note that even if a buffer barrier is set, it may not currently
        * be active when also an interval or global refresh interval with a
        * higher priority is active. This method will return true if
        * `setBufferBarrier()` was ever called or a value was assigned to the
        * buffer barrier property during configuration.
        *
        * @return {boolean} True if a buffer barrier is set, else false.
        */
        dfpRefresh.hasBufferBarrier = function() {
          return self.bufferBarrier !== null;
        };

        /**
        * Tests if a buffer barrier is currently active.
        * @return {boolean} True if a buffer barrier is enabled, else false.
        */
        dfpRefresh.bufferBarrierIsEnabled = function() {
          return isEnabled.barrier;
        };

        /**
        * Tests if the current buffer barrier has "one-shot" behavior enabled.
        *
        * If a barrier is "one-shot", this means it is disabled after the
        * barrier count is reached for the first time.
        *
        * @return {boolean} True if "one-shot" behavior is active, else false.
        */
        dfpRefresh.bufferBarrierIsOneShot = function() {
          return self.oneShotBarrier;
        };

        /**
        * Sets the global refresh interval.
        *
        * This is the interval at which all ads are refreshed.
        *
        * @param {number|string} interval The new interval
        *                        (as valid for the `parseDuration` service.)
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.setRefreshInterval = function(interval) {
          self.refreshInterval = parseDuration(interval);
          enableRefreshInterval();
          prioritize();

          return dfpRefresh;
        };

        /**
        * Tests if any refresh interval is set.
        *
        * Note that even if a refresh interval is set, it may not currently
        * be active when also a buffer barrier or interval with a
        * higher priority is active. This method will return true if
        * `setRefreshInterval()` was ever called or a value was assigned to
        * the refreshInterval property during configuration.
        *
        * @return {boolean} True if an interval is set, else false.
        */
        dfpRefresh.hasRefreshInterval = function() {
          return self.refreshInterval !== null;
        };

        /**
        * Tests if the refresh interval is currently active.
        * @return {boolean} True if a refresh interval
        *                   is currently active, else false.
        */
        dfpRefresh.refreshIntervalIsEnabled = function() {
          return isEnabled.refresh;
        };

        /**
        * Clears any refresh interval set.
        * @return {Function} The current `dfpRefresh` instance.
        */
        dfpRefresh.clearRefreshInterval = function() {
          if (!dfpRefresh.hasRefreshInterval()) {
            console.warn("clearRefreshInterval had no effect because " +
                         "no refresh interval was set.");
          }

          disableRefreshInterval();
          prioritize();

          return dfpRefresh;
        };

        /**
        * Returns the current refresh interval, if any (may be `null`).
        * @return {Number} The current refresh interval.
        */
        dfpRefresh.getRefreshInterval = function() {
          return self.refreshInterval;
        };

        /**
        * Checks if either of the buffering mechanisms are enabled.
        * @return {!boolean} True if either the buffer barrier or
        *                   interval are enabled, else false
        */
        dfpRefresh.isBuffering = function() {
          return [Options.BARRIER, Options.INTERVAL].some(dfpRefresh.isEnabled);
        };

        /**
        * Tests if the given refreshing/buffering mechanism is installed.
        *
        * Installed does not mean active, as this is
        * determined by the prioritization algorithm.
        *
        * @param  {String}  option What to test activation for.
        * @return {!boolean} True if the given option was ever
        *                   installed, else false.
        */
        dfpRefresh.has = function(option) {
          switch (option) {
            case Options.REFRESH: return dfpRefresh.hasRefreshInterval();
            case Options.INTERVAL: return dfpRefresh.hasBufferInterval();
            case Options.BARRIER: return dfpRefresh.hasBufferBarrier();
            default: throw new DFPRefreshError(`Invalid option '${option}'`);
          }
        };

        /**
        * Tests if the given refreshing/buffering mechanisms is active.
        *
        * Note that being enabled is stronger than being installed (`has`),
        * since to be enabled the mechanism must be set, but also installed
        * by the prioritization algorithm.
        *
        * @param  {String}  option What to test for.
        * @return {!boolean} True if the option is enabled, else false.
        * @see dfpRefresh.Options
        * @throws DFPRefreshError if the option is not one of
        *         the DFPRefresh.Options members.
        */
        dfpRefresh.isEnabled = function(option) {
          ensureValidOption(option);
          return isEnabled[option];
        };

        /**
        * Sets the priority for the given option.
        *
        * The prioritzation algorithm allows mutual exclusion of any of the
        * three buffering/refreshing options. More precisely, only the
        * mechanisms whose priority is the maximum of all three will be
        * enabled, if installed. This means that when all have equal priority,
        * all three will be enabled (because their priority is equal to the
        * maximum), but when one has higher priority only that will run.
        *
        * @param {!String} option What to set the priority for.
        * @param {Number} priority The priority to set.
        * @return {Function} The current dfpRefresh instance.
        * @see dfpRefresh.Options
        * @throws DFPRefreshError if the option is not one of
        *         the DFPRefresh.Options members.
        */
        dfpRefresh.setPriority = function(option, priority) {
          ensureValidOption(option);
          ensureValidPriority(priority);
          self.priority[option] = priority;

          return dfpRefresh;
        };

        /**
        * Gets the priority setting for a given option.
        * @param  {String} option The option to check.
        * @return {Number} The priority of the option.
        */
        dfpRefresh.getPriority = function(option) {
          ensureValidOption(option);
          return self.priority[option];
        };

        /**
        * Sets the priority of the global refreshing mechanism.
        * @param {Number} priority The priority to give.
        */
        dfpRefresh.setRefreshPriority = function(priority) {
          dfpRefresh.setPriority('refresh');
        };

        /**
        * @return {Number} The priority of the global refreshing mechanism.
        */
        dfpRefresh.getRefreshPriority = function() {
          return dfpRefresh.getPriority('refresh');
        };

        /**
        * Sets the priority of the buffer barrier.
        * @param {Number} priority The priority to give.
        */
        dfpRefresh.setBarrierPriority = function(priority) {
          dfpRefresh.setPriority('barrier');
        };

        /**
        * @return {Number} The priority of the buffer barrier.
        */
        dfpRefresh.getBarrierPriority = function() {
          return dfpRefresh.getPriority('barrier');
        };

        /**
        * Sets the priority of the buffer interval.
        * @param {Number} priority The priority to give.
        */
        dfpRefresh.setIntervalPriority = function(priority) {
          ensureValidPriority(priority);
          dfpRefresh.setPriority('interval');
        };

        /**
        * @return {Number} The priority of the buffer interval.
        */
        dfpRefresh.getIntervalPriority = function() {
          return dfpRefresh.getPriority('interval');
        };

        /**
        * Utility function to check if an option is valid and throw if not.
        * @param  {String} option The option to check.
        * @throws DFPRefreshError if the option is not valid.
        */
        function ensureValidOption(option) {
          if (!(option in Options)) {
            throw new DFPRefreshError(`Invalid option '${option}'`);
          }
        }

        /**
        * Utility function to check if a priority is valid and throw if not.
        * @param  {*} priority The priority to check.
        * @throws DFPRefreshError if the priority is not valid.
        */
        function ensureValidPriority(priority) {
          if (typeof priority !== `number`) {
            throw new DFPRefreshError(`Priority '${priority}' is not a number`);
          }
        }

        /**
        * Enables or disables an option.
        * @param  {String} option The option to check.
        * @param  {boolean=} yes Whether to enable or not.
        */
        function enable(option, yes) {
          if (yes === false) {
            disable(option);
            return;
          }

          switch (option) {
            case Options.REFRESH: enableRefreshInterval(); break;
            case Options.INTERVAL: enableBufferInterval(); break;
            case Options.BARRIER: enableBufferBarrier(); break;
            default: console.assert(false);
          }
        }

        /**
        * Disables the given option.
        * @param  {String} option The option to disable.
        */
        function disable(option) {
          switch (option) {
            case Options.REFRESH: disableRefreshInterval(); break;
            case Options.INTERVAL: disableBufferInterval(); break;
            case Options.BARRIER: disableBufferBarrier(); break;
            default: console.assert(false);
          }
          /* eslint-enable max-statements-per-line*/
        }

        /**
        * The prioritization algorithm.
        *
        * Given the set of all available options O, where availability is
        * determined by the semantics of dfpRefresh.has, where each element o
        * in O has a given priority p_o, the algorithm will proceed to find the
        * maximum ofver all p_o. Given the maximum, all those options o in O
        * whose priority is equal to the maximum are enabled and all others
        * disabled.
        */
        function prioritize() {
          /**
          * The options theoretically possible.
          * @type {Array}
          */
          let options = Object.keys(Options);

          /**
          * The options available (installed).
          * @type {Array}
          */
          let available = options.filter(dfpRefresh.has);

          /**
          * The priorities of the available options.
          * @type {Array}
          */
          let priorities = available.map(option => self.priority[option]);

          /**
          * The maximum priority.
          * @type {Number}
          */
          let maximum = priorities.reduce((a, b) => Math.max(a, b));

          for (let index = 0; index < available.length; ++index) {
            if (priorities[index] === maximum) {
              enable(available[index]);
            } else {
              disable(available[index]);
            }
          }
        }

        /**
        * The main refreshing function.
        *
        * This function will either refresh all slots if called with no
        * arguments, or else all the slots passed in the array argument.
        *
        * @param  {?Array=} tasks An array of `(slot, promise)` pairs.
        */
        function refresh(tasks) {
          console.assert(tasks === undefined || tasks !== null);

          // If 'tasks' was not passed at all, we refresh all ads
          if (tasks === undefined) {
            googletag.pubads().refresh();
            return;
          }

          // Do nothing for a null or empty buffer
          if (tasks.length === 0) return;

          // Refresh any non-null slots. Slots can be null when the buffer is
          // not empty when the refresh interval triggers. The buffer can then
          // not be cleared, because that might mess with barriers. We also
          // can't reduce the barrier, because it may not be one-shot (i.e.
          // persistent).
          tasks = tasks.filter(pair => pair.slot !== null);

          googletag.cmd.push(() => {
            googletag.pubads().refresh(tasks.map(task => task.slot));
            tasks.forEach(task => task.deferred.resolve());
          });
        }

        /**
        * Sends the buffer off for refreshing and clears it.
        */
        function flushBuffer() {
          refresh(buffer);
          buffer = [];
        }

        /**
        * Enables the global refresh interval.
        */
        function enableRefreshInterval() {
          console.assert(dfpRefresh.hasRefreshInterval());

          const task = function() {
            // Set the elments currently in the buffer to null,
            // since all ads will be refreshed, but the length
            //  must remain unchanged in case the barrier is not yet fulfilled
            buffer.fill(null);

            // Calling refresh() without any arguments
            // will refresh all registered ads on the site
            refresh();
          };

          const promise = $interval(task, self.refreshInterval);
          intervals.refresh = promise;
          isEnabled.refresh = true;
        }

        /**
        * Disables the refresh interval.
        *
        * The function is idempotent. That is, it is only effective if the
        * refresh interval is actually set, else it does nothing.
        */
        function disableRefreshInterval() {
          if (isEnabled.refresh) {
            $interval.cancel(intervals.refresh);
            intervals.refresh = null;
            isEnabled.refresh = false;
          }
        }

        /**
        * Enables the buffer interval.
        */
        function enableBufferInterval() {
          console.assert(dfpRefresh.hasBufferInterval());

          // Because the buffer interval may interleave with a barrier we don't
          // want the interval to take away elements that would prevent the
          // barrier from being reached just because the interval happened
          // before. As such, we still refresh, but then still take up the same
          // amount of space as before.
          const task = function() {
            refresh(buffer);
            buffer.fill(null);
          };

          const promise = $interval(task, self.bufferInterval);
          intervals.buffer = promise;
          isEnabled.interval = true;
        }

        /**
        * Disables the buffer interval.
        *
        * The function is idempotent. That is, it is only effective if the
        * buffer interval is actually set, else it does nothing.
        */
        function disableBufferInterval() {
          if (isEnabled.interval) {
            $interval.cancel(intervals.buffer);
            intervals.buffer = null;
            isEnabled.interval = false;
          }
        }

        /**
        * Enables the buffer barrier.
        */
        function enableBufferBarrier() {
          console.assert(dfpRefresh.hasBufferBarrier());
          isEnabled.barrier = true;
        }

        /**
        * Disables the buffer barrier.
        *
        * The function is idempotent. That is, it is only effective if the
        * buffer barrier is actually set, else it does nothing.
        */
        function disableBufferBarrier() {
          isEnabled.barrier = false;
        }

        /**
        * Adds an interval for a given slot.
        * @param {!Object} task The `(slot, promise)` object.
        * @param {string|number} interval The interval duration to set.
        */
        function addSlotInterval(task, interval) {
          interval = parseDuration(interval);
          const promise = $interval(() => { scheduleRefresh(task); }, interval);
          intervals[task.slot] = promise;
        }

        /**
        * Schedules a refresh for a slot.
        *
        * This function is basically a proxy to refresh(), as it may either
        * buffer the refresh call or do it immediately.
        *
        * @param  {!Object} task The `(slot, promise)` object.
        * @see bufferRefresh()
        */
        function scheduleRefresh(task) {
          if (dfpRefresh.isBuffering()) {
            bufferRefresh(task);
          } else {
            refresh([task]);
          }
        }

        /**
        * Buffers a refresh call for a slot.
        * @param  {!Object} task The `(slot, promise)` object.
        */
        function bufferRefresh(task) {
          buffer.push(task);

          if (!isEnabled[Options.BARRIER]) return;
          if (buffer.length === self.bufferBarrier) {
            flushBuffer();
            if (self.oneShotBarrier) {
              dfpRefresh.clearBufferBarrier();
            }
          }
        }

        // Unregister all listeners when the root scope dies
        $rootScope.$on('$destroy', function() {
          // eslint-disable-next-line no-undef
          intervals.forEach(promise => {
            $interval.cancel(promise);
          });
        });

        prioritize();

        return dfpRefresh;
      }];
  }

  module.provider('dfpRefresh', [dfpRefreshProvider]);
// eslint-disable-next-line
})(angularDfp);
