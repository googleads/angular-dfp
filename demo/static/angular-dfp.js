/**
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
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var angularDfp = angular.module('angularDfp', []);


( function (module) {
  'use strict';


  function httpErrorFactory($log) {
    function httpError(response, message) {
      $log.error('Error (' + response.status + ')');
    }

    httpError.isErrorCode = function (code) {
      if (typeof code === 'number') {
        return !(code >= 200 && code < 300);
      }

      console.assert(typeof code === 'string');

      return code[0] !== '2';
    };

    return httpError;
  }

  module.factory('httpError', ['$log', httpErrorFactory]);

})(angularDfp);


( function (module) {
  'use strict';


  var DFPDurationError = function (_Error) {
    _inherits(DFPDurationError, _Error);

    function DFPDurationError(interval) {
      _classCallCheck(this, DFPDurationError);

      return _possibleConstructorReturn(this, (DFPDurationError.__proto__ || Object.getPrototypeOf(DFPDurationError)).call(this, 'Invalid interval: \'' + interval + '\'ls'));
    }

    return DFPDurationError;
  }(Error);



  function parseDurationFactory() {
    function convertToMilliseconds(time, unit) {
      console.assert(/^(m?s|min|h)$/g.test(unit));

      if (unit === 'ms') return time;
      if (unit === 's') return time * 1000;
      if (unit === 'min') return time * 60 * 1000;

      return time * 60 * 60 * 1000;
    }

    function convert(match) {
      var time = parseInt(match[1], 10);

      if (match.length === 2) return time;

      return convertToMilliseconds(time, match[2]);
    }

    function parseDuration(interval) {
      if (typeof interval === 'number') {
        return interval;
      }

      if (typeof interval !== 'string') {
        throw new TypeError('\'' + interval + '\' must be of number or string type');
      }

      var match = interval.match(/(\d+)(m?s|min|h)?/);

      if (!match) {
        throw new DFPDurationError(interval);
      }

      return convert(match);
    }

    return parseDuration;
  }

  module.factory('parseDuration', parseDurationFactory);

})(angularDfp);


( function (module) {
  'use strict';


  function responsiveResizeFactory($interval, $timeout, $window) {
    $window = angular.element($window);

    function responsiveResize(element, slot, boundaries) {
      boundaries = boundaries || [320, 780, 1480];
      console.assert(Array.isArray(boundaries));

      var POLL_INTERVAL = 100; 

      var POLL_DURATION = 2500; 

      function queryIFrame() {
        return element.find('div iframe');
      }

      function normalizeIFrame(iframe) {
        iframe = iframe || queryIFrame();
        iframe.css('width', iframe.attr('width') + 'px');
        iframe.css('height', iframe.attr('height') + 'px');
      }

      function hideElement() {
        element.addClass('hidden');
      }

      function showElement() {
        $timeout(function () {
          element.removeClass('hidden');
        }, 1000);
      }

      function pollForChange(initial) {
        var iframe = queryIFrame();

        var change = ['width', 'height'].some(function (dimension) {
          return iframe.attr(dimension) !== initial[dimension];
        });

        if (change) normalizeIFrame(iframe);
      }

      function startPolling(initial) {
        var poll = $interval(function () {
          return pollForChange(initial);
        }, POLL_INTERVAL);

        $timeout(function () {
          return $interval.cancel(poll);
        }, POLL_DURATION);
      }

      function getIframeDimensions() {
        var iframe = queryIFrame();
        var dimensions = [iframe.css('width'), iframe.css('height')];

        var plain = dimensions.map(function (dimension) {
          return dimension ? dimension.slice(0, -2) : null;
        });

        return { width: plain[0], height: plain[1] };
      }

      function watchResize() {
        startPolling(getIframeDimensions());

        $window.on('resize', function () {
          normalizeIFrame();
        });

        showElement();
      }

      function makeResponsive() {
        function determineIndex() {
          var width = $window.innerWidth;
          var last = boundaries.length - 1;

          for (var _index = 0, _last; _index < _last; ++_index) {
            if (width < boundaries[_index + 1]) return _index;
          }

          return last;
        }

        var index = determineIndex();

        function couldGrow() {
          if (index + 1 >= boundaries.length) return false;
          if ($window.innerWidth < boundaries[index + 1]) return false;
          return true;
        }

        function couldShrink() {
          if (index - 1 < 0) return false;
          if ($window.innerWidth >= boundaries[index]) return false;
          return true;
        }

        function transition(delta) {
          console.assert(index >= 0 && index < boundaries.length);
          console.assert(delta === -1 || delta === +1);

          index += delta;
          hideElement();


          console.assert(index >= 0 && index < boundaries.length);
        }

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
  }

  module.factory('responsiveResize', ['$interval', '$timeout', '$window', 'dfpRefresh', responsiveResizeFactory]);

})(angularDfp);


( function (module) {
  'use strict';


  function scriptInjectorFactory($q, httpError) {
    function createScript(url) {
      var script = document.createElement('script');
      var ssl = document.location.protocol === 'https:';

      script.async = 'async';
      script.type = 'text/javascript';
      script.src = (ssl ? 'https:' : 'http:') + url;

      return script;
    }

    function promiseScript(script, url) {
      var deferred = $q.defer();

      function resolve() {
        deferred.resolve();
      }

      function reject(response) {
        response = response || { status: 400 };
        httpError(response, 'loading script "{0}".', url);

        deferred.reject(response);
      }

      script.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (httpError.isErrorCode(this.status)) {
            reject(this);
          } else {
            resolve();
          }
        }
      };

      script.onload = resolve;
      script.onerror = reject;

      return deferred.promise;
    }

    function injectScript(script) {
      var head = document.head || document.querySelector('head');
      head.appendChild(script);
    }

    function scriptInjector(url) {
      var script = createScript(url);
      injectScript(script);
      return promiseScript(script, url);
    }

    return scriptInjector;
  }

  module.factory('scriptInjector', ['$q', 'httpError', scriptInjectorFactory]);

})(angularDfp);


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

( function (module) {
  'use strict';


  function dfpAdController() {
    var sizes = [];

    var responsiveMapping = [];

    var targetings = [];

    var exclusions = [];

    var scripts = [];

    this.isValid = function () {
      if (sizes.length === 0) return false;
      if (!this['adUnit']) return false;
      return true;
    };

    this.getState = function () {
      console.assert(this.isValid());
      return Object.freeze({
        sizes: sizes,
        responsiveMapping: responsiveMapping,
        targetings: targetings,
        exclusions: exclusions,
        adUnit: this['adUnit'],
        forceSafeFrame: this['forceSafeFrame'],
        safeFrameConfig: this['safeFrameConfig'],
        clickUrl: this['clickUrl'],
        refresh: this['refresh'],
        scripts: scripts,
        collapseIfEmpty: this['collapseIfEmpty']
      });
    };

    this.addSize = function (size) {
      sizes.push(size);
    };

    this.addResponsiveMapping = function (mapping) {
      responsiveMapping.push(mapping);
    };

    this.addTargeting = function (targeting) {
      targetings.push(targeting);
    };

    this.addExclusion = function (exclusion) {
      exclusions.push(exclusion);
    };

    this.addScript = function (script) {
      scripts.push(script);
    };
  }

  function dfpAdDirective(scope, element, attributes, controller, $injector) {
    var dfp = $injector.get('dfp');
    var dfpIDGenerator = $injector.get('dfpIDGenerator');
    var dfpRefresh = $injector.get('dfpRefresh');
    var responsiveResize = $injector.get('responsiveResize');

    var ad = controller.getState();

    var jQueryElement = element;
    element = element[0];

    dfpIDGenerator(element);

    function addResponsiveMapping(slot) {
      if (ad.responsiveMapping.length === 0) return;

      var sizeMapping = googletag.sizeMapping();

      ad.responsiveMapping.forEach(function (mapping) {
        sizeMapping.addSize(mapping.browserSize, mapping.adSizes);
      });

      slot.defineSizeMapping(sizeMapping.build());
    }

    function defineSlot() {
      var slot = googletag.defineSlot(ad.adUnit, ad.sizes, element.id);

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
        slot.setSafeFrameConfig(
        JSON.parse(ad.safeFrameConfig));
      }

      addResponsiveMapping(slot);

      ad.targetings.forEach(function (targeting) {
        slot.setTargeting(targeting.key, targeting.values);
      });

      ad.exclusions.forEach(function (exclusion) {
        slot.setCategoryExclusion(exclusion);
      });

      ad.scripts.forEach(function (script) {
        script(slot);
      });

      slot.addService(googletag.pubads());

      googletag.display(element.id);

      dfpRefresh(slot, ad.refresh).then(function () {
        if (ad.responsiveMapping.length > 0) {
          responsiveResize(jQueryElement);
        }
      });

      scope.$on('$destroy', function () {
        console.assert(googletag.destroySlots([slot]));
      });
    }

    dfp.then(defineSlot);
  }

  module.directive('dfpAd', ['$injector', function ($injector) {
    return {
      restrict: 'AE',
      controller: dfpAdController,
      controllerAs: 'controller',
      bindToController: true,
      link: function link() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        dfpAdDirective.apply(null, args.slice(0, 4).concat($injector));
      },
      scope: {
        'adUnit': '@',
        'clickUrl': '@',
        'forceSafeFrame': '@',
        'safeFrameConfig': '@',
        'refresh': '@',
        'collapseIfEmpty': '@'
      }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpAudiencePixelDirective(scope, element, attributes) {
    var axel = String(Math.random());
    var random = axel * 10000000000000;


    var adUnit = '';
    if (scope.adUnit) {
      adUnit = 'dc_iu=' + scope['adUnit'];
    }

    var ppid = '';
    if (scope.ppid) {
      ppid = 'ppid=' + scope['ppid'];
    }

    var pixel = document.createElement('img');

    pixel.src = 'https://pubads.g.doubleclick.net/activity;ord=';
    pixel.src += random + ';dc_seg=' + scope['segmentId'] + ';' + adUnit + ppid;


    pixel.width = 1;
    pixel.height = 1;
    pixel.border = 0;
    pixel.style.visibility = 'hidden';

    element.append(pixel);
  }

  module.directive('dfpAudiencePixel', [function () {
    return {
      restrict: 'E',
      link: dfpAudiencePixelDirective,
      scope: { 'adUnit': '@', 'segmentId': '@', 'ppid': '@' }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpExclusionDirective(scope, element, attributes, ad) {
    ad.addExclusion(element.html());
  }

  module.directive('dfpExclusion', [function () {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      link: dfpExclusionDirective
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpIDGeneratorFactory() {
    var generatedIDs = {};

    function generateID() {
      var id = null;

      do {
        var number = Math.random().toString().slice(2);
        id = 'gpt-ad-' + number;
      } while (id in generatedIDs);

      generatedIDs[id] = true;

      return id;
    }

    function dfpIDGenerator(element) {
      if (element && element.id && !(element.id in generatedIDs)) {
        return element.id;
      }

      var id = generateID();
      if (element) element.id = id;

      return id;
    }

    dfpIDGenerator.isTaken = function (id) {
      return id in generatedIDs;
    };

    dfpIDGenerator.isUnique = function (id) {
      return !dfpIDGenerator.isTaken(id);
    };

    return dfpIDGenerator;
  }

  module.factory('dfpIDGenerator', [dfpIDGeneratorFactory]);

})(angularDfp);


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

( function (module) {
  'use strict';


  var DFPRefreshError = function (_Error2) {
    _inherits(DFPRefreshError, _Error2);

    function DFPRefreshError() {
      _classCallCheck(this, DFPRefreshError);

      return _possibleConstructorReturn(this, (DFPRefreshError.__proto__ || Object.getPrototypeOf(DFPRefreshError)).apply(this, arguments));
    }

    return DFPRefreshError;
  }(Error);



  function dfpRefreshProvider() {
    var self = this;

    self.bufferInterval = 1000;

    self.bufferBarrier = null;

    self.oneShotBarrier = true;

    self.refreshInterval = 60 * 60 * 1000; 

    self.priority = {
      REFRESH: 1,
      INTERVAL: 1,
      BARRIER: 1
    };

    self.$get = ['$rootScope', '$interval', '$q', 'parseDuration', function ($rootScope, $interval, $q, parseDuration) {
      var Options = Object.freeze({
        REFRESH: 'refresh',
        INTERVAL: 'interval',
        BARRIER: 'barrier'
      });

      dfpRefresh.Options = Object.freeze({
        'REFRESH': Options.REFRESH,
        'INTERVAL': Options.INTERVAL,
        'BARRIER': Options.BARRIER
      });

      var buffer = [];

      var intervals = { refresh: null, buffer: null };

      var isEnabled = Object.seal({
        refresh: self.refreshInterval !== null,
        interval: self.bufferInterval !== null,
        barrier: self.bufferBarrier !== null
      });

      function dfpRefresh(slot, interval, defer) {
        var deferred = $q.defer();
        var task = { slot: slot, deferred: deferred };

        if (interval) {
          addSlotInterval(task, interval);
        }

        if (!interval || !defer) {
          scheduleRefresh(task);
        }

        return deferred.promise;
      }

      dfpRefresh.cancelInterval = function (slot) {
        if (!dfpRefresh.hasSlotInterval(slot)) {
          throw new DFPRefreshError("No interval for given slot");
        }

        $interval.cancel(intervals[slot]);
        delete intervals[slot];

        return dfpRefresh;
      };

      dfpRefresh.hasSlotInterval = function (slot) {
        return slot in intervals;
      };

      dfpRefresh.setBufferInterval = function (interval) {
        self.bufferInterval = parseDuration(interval);
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.clearBufferInterval = function () {
        if (!dfpRefresh.hasBufferInterval()) {
          console.warn("clearBufferInterval had no " + "effect because no interval was set.");
          return dfpRefresh;
        }

        disableBufferInterval();
        self.bufferInterval = null;

        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.hasBufferInterval = function () {
        return self.bufferInterval !== null;
      };

      dfpRefresh.bufferIntervalIsEnabled = function () {
        return isEnabled.interval;
      };

      dfpRefresh.getBufferInterval = function () {
        return self.bufferInterval;
      };

      dfpRefresh.setBufferBarrier = function (numberOfAds, oneShot) {
        self.bufferBarrier = numberOfAds;
        self.oneShotBarrier = oneShot === undefined ? true : oneShot;
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.clearBufferBarrier = function () {
        if (!dfpRefresh.hasBufferBarrier()) {
          console.warn("clearBufferBarrier had not effect because " + "no barrier was set.");
          return dfpRefresh;
        }

        self.bufferBarrier = null;
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.getBufferBarrier = function () {
        return self.bufferBarrier;
      };

      dfpRefresh.hasBufferBarrier = function () {
        return self.bufferBarrier !== null;
      };

      dfpRefresh.bufferBarrierIsEnabled = function () {
        return isEnabled.barrier;
      };

      dfpRefresh.bufferBarrierIsOneShot = function () {
        return self.oneShotBarrier;
      };

      dfpRefresh.setRefreshInterval = function (interval) {
        self.refreshInterval = parseDuration(interval);
        enableRefreshInterval();
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.hasRefreshInterval = function () {
        return self.refreshInterval !== null;
      };

      dfpRefresh.refreshIntervalIsEnabled = function () {
        return isEnabled.refresh;
      };

      dfpRefresh.clearRefreshInterval = function () {
        if (!dfpRefresh.hasRefreshInterval()) {
          console.warn("clearRefreshInterval had no effect because " + "no refresh interval was set.");
        }

        disableRefreshInterval();
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.getRefreshInterval = function () {
        return self.refreshInterval;
      };

      dfpRefresh.isBuffering = function () {
        return isEnabled.buffer || isEnabled.interval;
      };

      dfpRefresh.has = function (option) {
        switch (option) {
          case Options.REFRESH:
            return dfpRefresh.hasRefreshInterval();
          case Options.INTERVAL:
            return dfpRefresh.hasBufferInterval();
          case Options.BARRIER:
            return dfpRefresh.hasBufferBarrier();
          default:
            throw new DFPRefreshError('Invalid option \'' + option + '\'');
        }
      };

      dfpRefresh.setPriority = function (option, priority) {
        ensureValidOption(option);
        ensureValidPriority(priority);
        self.priority[option] = priority;

        return dfpRefresh;
      };

      dfpRefresh.getPriority = function (option) {
        ensureValidOption(option);
        return self.priority[option];
      };

      dfpRefresh.setRefreshPriority = function (priority) {
        ensureValidPriority(priority);
        dfpRefresh.setPriority('refresh', priority);
      };

      dfpRefresh.getRefreshPriority = function () {
        return dfpRefresh.getPriority('refresh');
      };

      dfpRefresh.setBarrierPriority = function (priority) {
        ensureValidPriority(priority);
        dfpRefresh.setPriority('barrier', priority);
      };

      dfpRefresh.getBarrierPriority = function () {
        return dfpRefresh.getPriority('barrier');
      };

      dfpRefresh.setIntervalPriority = function (priority) {
        ensureValidPriority(priority);
        dfpRefresh.setPriority('interval', priority);
      };

      dfpRefresh.getIntervalPriority = function () {
        return dfpRefresh.getPriority('interval');
      };

      function ensureValidOption(option) {
        if (!(option in Options)) {
          throw new DFPRefreshError('Invalid option \'' + option + '\'');
        }
      }

      function ensureValidPriority(priority) {
        if (typeof priority !== 'number') {
          throw new DFPRefreshError('Priority \'' + priority + '\' is not a number');
        }
      }

      function enable(option, yes) {
        if (yes === false) {
          disable(option);
          return;
        }

        switch (option) {
          case Options.REFRESH:
            enableRefreshInterval();break;
          case Options.INTERVAL:
            enableBufferInterval();break;
          case Options.BARRIER:
            enableBufferBarrier();break;
          default:
            console.assert(false);
        }
      }

      function disable(option) {
        switch (option) {
          case Options.REFRESH:
            disableRefreshInterval();break;
          case Options.INTERVAL:
            disableBufferInterval();break;
          case Options.BARRIER:
            disableBufferBarrier();break;
          default:
            console.assert(false);
        }
      }

      function prioritize() {
        var options = Object.keys(Options).map(function (key) {
          return Options[key];
        });

        var available = options.filter(dfpRefresh.has);

        var priorities = available.map(function (option) {
          return self.priority[option];
        });

        var maximum = priorities.reduce(function (a, b) {
          return Math.max(a, b);
        });

        for (var index = 0; index < available.length; ++index) {
          if (priorities[index] === maximum) {
            enable(available[index]);
          } else {
            disable(available[index]);
          }
        }
      }

      function refresh(tasks) {
        console.assert(tasks === undefined || tasks !== null);

        if (tasks === undefined) {
          googletag.pubads().refresh();
          return;
        }

        if (tasks.length === 0) return;

        tasks = tasks.filter(function (pair) {
          return pair.slot !== null;
        });

        googletag.cmd.push(function () {
          googletag.pubads().refresh(tasks.map(function (task) {
            return task.slot;
          }));
          tasks.forEach(function (task) {
            return task.deferred.resolve();
          });
        });
      }

      function flushBuffer() {
        refresh(buffer);
        buffer = [];
      }

      function enableRefreshInterval() {
        console.assert(dfpRefresh.hasRefreshInterval());

        var task = function task() {
          nullifyBuffer();

          refresh();
        };

        var promise = $interval(task, self.refreshInterval);
        intervals.refresh = promise;
        isEnabled.refresh = true;
      }

      function disableRefreshInterval() {
        if (isEnabled.refresh) {
          $interval.cancel(intervals.refresh);
          intervals.refresh = null;
          isEnabled.refresh = false;
        }
      }

      function enableBufferInterval() {
        console.assert(dfpRefresh.hasBufferInterval());

        var task = function task() {
          refresh(buffer);
          nullifyBuffer();
        };

        var promise = $interval(task, self.bufferInterval);
        intervals.buffer = promise;
        isEnabled.interval = true;
      }

      function disableBufferInterval() {
        if (isEnabled.interval) {
          $interval.cancel(intervals.buffer);
          intervals.buffer = null;
          isEnabled.interval = false;
        }
      }

      function enableBufferBarrier() {
        console.assert(dfpRefresh.hasBufferBarrier());
        isEnabled.barrier = true;
      }

      function disableBufferBarrier() {
        isEnabled.barrier = false;
      }

      function nullifyBuffer() {
        for (var i = 0; i < buffer.length; ++i) {
          buffer[i] = null;
        }
      }

      function addSlotInterval(task, interval) {
        interval = parseDuration(interval);
        var promise = $interval(function () {
          scheduleRefresh(task);
        }, interval);
        intervals[task.slot] = promise;
      }

      function scheduleRefresh(task) {
        if (dfpRefresh.isBuffering()) {
          bufferRefresh(task);
        } else {
          refresh([task]);
        }
      }

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

      $rootScope.$on('$destroy', function () {
        console.log('destroy!');
        intervals.forEach(function (promise) {
          $interval.cancel(promise);
        });
      });

      prioritize();

      return dfpRefresh;
    }];
  }

  module.provider('dfpRefresh', [dfpRefreshProvider]);
})(angularDfp);


( function (module) {
  'use strict';


  function DFPResponsiveController() {
    var browserSize = Object.seal([this['browserWidth'], this['browserHeight'] || 0]);

    var adSizes = [];

    function isValid() {
      if (browserSize.some(function (value) {
        return typeof value !== 'number';
      })) return false;
      return adSizes.length > 0;
    }

    this.addSize = function (size) {
      adSizes.push(size);
    };

    this.getState = function () {
      console.assert(isValid());
      return Object.freeze({
        browserSize: browserSize,
        adSizes: adSizes
      });
    };
  }

  DFPResponsiveController.$inject = ['$scope'];

  function dfpResponsiveDirective(scope, element, attributes, ad) {
    var mapping = scope.controller.getState();
    ad.addResponsiveMapping(mapping);
  }

  module.directive('dfpResponsive', [function () {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      controller: DFPResponsiveController,
      controllerAs: 'controller',
      bindToController: true,
      link: dfpResponsiveDirective,
      scope: { 'browserWidth': '=', 'browserHeight': '=' }
    };
  }]);

})(angularDfp);



( function (module) {
  'use strict';


  function dfpScriptDirective(scope, element, attributes, ad, $injector) {
    var format = $injector.get('dfpFormat');
    var script = format('(function(scope, {0}) { {1} })', scope.slotAs || 'slot', element.html().trim());

    ad.addScript(eval(script).bind(null, scope.scope));
  }

  module.directive('dfpScript', ['$injector', function ($injector) {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      scope: { slotAs: '@', scope: '=' },
      link: function link() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        dfpScriptDirective.apply(null, args.concat($injector));
      }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function DFPSizeDirective(scope, element, attributes, parent) {
    parent = parent[1] || parent[0];

    console.assert(parent);

    if (scope.width && scope.height) {
      parent.addSize([scope.width, scope.height]);
    } else {
      parent.addSize(element[0].innerHTML);
    }
  }

  module.directive('dfpSize', [function () {
    return {
      restrict: 'E',
      require: ['?^^dfpAd', '?^^dfpResponsive'],
      scope: { width: '=', height: '=' },
      link: DFPSizeDirective
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpTargetingController() {
    var values = this.value ? [this.value] : [];

    this.isValid = function () {
      if (this.key === undefined) return false;
      if (values.length === 0) return false;
      return true;
    };

    this.getState = function () {
      console.assert(this.isValid());
      return Object.freeze({
        key: this.key,
        values: values
      });
    };

    this.addValue = function (value) {
      values.push(value);
    };
  }

  function dfpTargetingDirective(scope, element, attributes, ad) {
    console.assert(ad !== undefined);

    var targeting = scope.controller.getState();
    ad.addTargeting(targeting);
  }

  module.directive('dfpTargeting', [function () {
    return {
      restrict: 'E',
      require: '^^dfpAd', 
      controller: dfpTargetingController,
      controllerAs: 'controller',
      bindToController: true,
      scope: { key: '@', value: '@' },
      link: dfpTargetingDirective
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpValueDirective(scope, element, attributes, parent) {
    parent.addValue(element.html());
  }

  module.directive('dfpValue', [function () {
    return {
      restrict: 'E',
      require: '^^dfpTargeting',
      link: dfpValueDirective
    };
  }]);
})(angularDfp);


var angularDfpVideo = angular.module('angularDfp');

( function (module) {
  'use strict';


  function dfpVideoDirective(scope, element, attributes, $injector) {
    var dfpIDGenerator = $injector.get('dfpIDGenerator');

    element = element[0];

    console.assert(element.tagName === 'VIDEO');

    dfpIDGenerator(element, true);

    var player = videojs(element.id);

    player.ima({ id: element.id, adTagUrl: scope['adTag'] });
    player.ima.requestAds();
    player.ima.initializeAdDisplayContainer();
  }

  module.directive('dfpVideo', ['$injector', function ($injector) {
    return {
      restrict: 'A',
      scope: { 'adTag': '@' },
      link: function link() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        dfpVideoDirective.apply(null, args.concat($injector));
      }
    };
  }]);

  return module;

})(angularDfpVideo);


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

( function (module) {
  'use strict';

  var DFPConfigurationError = function (_Error3) {
    _inherits(DFPConfigurationError, _Error3);

    function DFPConfigurationError() {
      _classCallCheck(this, DFPConfigurationError);

      return _possibleConstructorReturn(this, (DFPConfigurationError.__proto__ || Object.getPrototypeOf(DFPConfigurationError)).apply(this, arguments));
    }

    return DFPConfigurationError;
  }(Error);



  module.constant('GPT_LIBRARY_URL', '//www.googletagservices.com/tag/js/gpt.js');

  function dfpProvider(GPT_LIBRARY_URL) {
    var self = this;

    self.enableVideoAds = true;

    self.collapseIfEmpty = true;

    self.centering = false;

    self.location = null;

    self.ppid = null;

    self.globalTargeting = null;

    self.forceSafeFrame = false;

    self.safeFrameConfig = null;

    self.loadGPT = true;

    var loaded = false;

    function addSafeFrameConfig(pubads) {
      if (!self.safeFrameConfig) return;
      if (_typeof(self.globalTargeting) !== 'object') {
        throw new DFPConfigurationError('Targeting must be an object');
      }
      pubads.setSafeFrameConfig(self.safeFrameConfig);
    }

    function addTargeting(pubads) {
      if (!self.globalTargeting) return;
      if (_typeof(self.globalTargeting) !== 'object') {
        throw new DFPConfigurationError('Targeting must be an object');
      }

      for (var key in self.globalTargeting) {
        if (self.globalTargeting.hasOwnProperty(key)) {
          pubads.setTargeting(key, self.globalTargeting[key]);
        }
      }
    }

    function addLocation(pubads) {
      if (!self.location) return;

      if (typeof self.location === 'string') {
        pubads.setLocation(self.location);
        return;
      }

      if (!Array.isArray(self.location)) {
        throw new DFPConfigurationError('Location must be an ' + 'array or string');
      }

      pubads.setLocation.apply(pubads, self.location);
    }

    function addPPID(pubads) {
      if (!self.ppid) return;
      if (typeof self.ppid !== 'string') {
        throw new DFPConfigurationError('PPID must be a string');
      }

      pubads.setPublisherProvidedId(self.ppid);
    }

    this.$get = ['scriptInjector', function (scriptInjector) {
      function setup() {
        var pubads = googletag.pubads();

        if (self.enableVideoAds) {
          pubads.enableVideoAds();
        }

        if (self.collapseIfEmpty) {
          pubads.collapseEmptyDivs();
        }

        pubads.disableInitialLoad();
        pubads.setForceSafeFrame(self.forceSafeFrame);
        pubads.setCentering(self.centering);

        addLocation(pubads);
        addPPID(pubads);
        addTargeting(pubads);
        addSafeFrameConfig(pubads);

        googletag.enableServices();
      }

      function dfp() {
        googletag.cmd.push(setup);

        if (self.loadGPT) {
          scriptInjector(GPT_LIBRARY_URL).then(function () {
            loaded = true;
          });
        }
      }

      dfp.hasLoaded = function () {
        return loaded;
      };

      dfp.then = function (task) {
        googletag.cmd.push(task);
      };

      return dfp;
    }];
  }

  module.provider('dfp', ['GPT_LIBRARY_URL', dfpProvider]);

})(angularDfp);