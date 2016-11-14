/**
 * @file VideoJS and IMA SDK externs for the Closure compiler.
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

/* eslint-disable valid-jsdoc, no-var, no-unused-vars */

/**
 * @constructor
 */
var Player = function() {};

/**
 * @param {Object} options
 */
Player.prototype.ima = function(options) {};

/**
 * Requests ads for a video.
 */
Player.prototype.ima.requestAds = function() {};

/**
 * Initializes the ad container.
 */
Player.prototype.ima.initializeAdDisplayContainer = function() {};

/**
 * @param  {string|Element} id      Video element or video element ID
 * @param  {Object=} options        Optional options object for config/settings
 * @param  {Function=} ready        Optional ready callback
 * @return {Player}                 A player instance
 */
var videojs = function(id, options, ready) {};
