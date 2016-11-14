/**
 * @file GPT externs for the Closure compiler.
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

/* eslint-disable valid-jsdoc, no-undef, camelcase, no-unused-expressions */

/**
 * @namespace
 */
// eslint-disable-next-line no-var
var googletag = {};

/**
 * @type {!Array<function()>|!googletag.CommandArray}
 */
googletag.cmd;

/**
 * @interface
 */
googletag.Service = function() {};

/**
 * @interface
 * @extends {googletag.Service}
 */
googletag.PubAdsService = function() {};

/**
 * @param {string|number} latitudeOrAddress
 * @param {number=} opt_longitude
 * @param {number=} opt_radius
 */
googletag.PubAdsService.prototype.setLocation =
    function(latitudeOrAddress, opt_longitude, opt_radius) {};

/**
 * @param  {Array<!googletag.Slot>=} opt_slots
 * @param  {{changeCorrelator: boolean}=} opt_options [description]
 */
googletag.PubAdsService.prototype.refresh = function(opt_slots, opt_options) {};

/**
 * Enables video ads.
 */
googletag.PubAdsService.prototype.enableVideoAds = function() {};

/**
 * @param {string} ppid
 * @return {!googletag.PubAdsService}
 */
googletag.PubAdsService.prototype.setPublisherProvidedId = function(ppid) {};

/**
 * @param {string} key
 * @param {string|!Array<string>} value
 * @return {!googletag.PubAdsService}
 */
googletag.PubAdsService.prototype.setTargeting = function(key, value) {};

/**
 * @param {boolean} forceSafeFrame
 */
googletag.PubAdsService.prototype.setForceSafeFrame =
  function(forceSafeFrame) {};

/**
 * @param {!googletag.SafeFrameConfig} config
 */
googletag.PubAdsService.prototype.setSafeFrameConfig = function(config) {};

/**
 * @param {boolean} centerAds
 */
googletag.PubAdsService.prototype.setCentering = function(centerAds) {};

/**
 * Disables loading ads on display calls.
 */
googletag.PubAdsService.prototype.disableInitialLoad = function() {};

/**
 * @param {boolean=} opt_collapseBeforeAdFetch
 * @return {boolean}
 */
googletag.PubAdsService.prototype.collapseEmptyDivs =
  function(opt_collapseBeforeAdFetch) {};

/**
 * @typedef {Array<number>}
 */
googletag.SingleSizeArray;

/**
 * @typedef {string}
 */
googletag.NamedSize;

/**
 * @typedef {googletag.SingleSizeArray|googletag.NamedSize}
 */
googletag.SingleSize;

/**
 * @typedef {Array<!googletag.SingleSize>}
 */
googletag.MultiSize;

/**
 * @typedef {Array<!googletag.GeneralSize>}
 */
googletag.SizeMapping;

/**
 * @typedef {(googletag.SingleSize|googletag.MultiSize)}
 */
googletag.GeneralSize;

/**
 * @typedef {Array<!googletag.GeneralSize>}
 */
googletag.SizeMappingArray;

/**
 * @interface
 */
googletag.SafeFrameConfig = function() {};

/**
 * @param  {string} adUnitPath
 * @param  {googletag.GeneralSize} size
 * @param  {string=} opt_div
 * @return {googletag.Slot}
 */
googletag.defineSlot = function(adUnitPath, size, opt_div) {};

/**
 * @return {!googletag.PubAdsService}
 */
googletag.pubads = function() {};

/**
 * Enables all GPT services.
 */
googletag.enableServices = function() {};

/**
 * @interface
 */
googletag.Slot = function() {};

/**
 * @param {boolean} forceSafeFrame
 */
googletag.Slot.prototype.setForceSafeFrame = function(forceSafeFrame) {};

/**
 * @param {string} categoryExclusion
 */
googletag.Slot.prototype.setCategoryExclusion = function(categoryExclusion) {};

/**
 * @param {string} value
 */
googletag.Slot.prototype.setClickUrl = function(value) {};

/**
 * @param {googletag.SafeFrameConfig} config
 */
googletag.Slot.prototype.setSafeFrameConfig = function(config) {};

/**
 * @param {!googletag.Service} service
 */
googletag.Slot.prototype.addService = function(service) {};

/**
 * @param {!googletag.SizeMapping} sizeMapping
 */
googletag.Slot.prototype.defineSizeMapping = function(sizeMapping) {};

/**
 * @param {string} key
 * @param {string|!Array<string>} value
 */
googletag.Slot.prototype.setTargeting = function(key, value) {};

/**
 * @param {boolean}  collapse
 * @param {boolean=}  opt_collapseBeforeAdFetch
 */
googletag.Slot.prototype.setCollapseEmptyDiv =
  function(collapse, opt_collapseBeforeAdFetch) {};

/**
 * @param  {Array<!googletag.Slot>=} opt_slots
 * @return {boolean}
 */
googletag.destroySlots = function(opt_slots) {};

/**
 * @interface
 */
googletag.CommandArray = function() {};

/**
 * @param {function()} f
 * @return {number}
 */
googletag.CommandArray.prototype.push = function(f) {};

/**
 * @interface
 */
googletag.SizeMappingBuilder = function() {};

/**
 * @param {!googletag.SingleSizeArray} viewportSize
 * @param {!googletag.GeneralSize} slotSize
 * @return {!googletag.SizeMappingBuilder}
 */
googletag.SizeMappingBuilder.prototype.addSize =
  function(viewportSize, slotSize) {};

/**
 * @return {!googletag.SizeMappingArray}
 */
googletag.SizeMappingBuilder.prototype.build = function() {};

/**
 * @return {!googletag.SizeMappingBuilder}
 */
googletag.sizeMapping = function() {};
