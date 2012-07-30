/**
 * @fileOverview Provides a mechanism for starting/stopping the repetition
 * of a function.  The rate & acceleration is currently hard-coded but
 * could/should be made configurable.
 */
exports.start = start;
exports.stop = stop;

var timeoutId;

var initialRate = 500;
var currentRate = initialRate;
var acceleration = 0.2;
var minimumRate = 5;

/**
 * Start repeating the given action
 * @param action
 */
function start(action) {
	
	var repeat = function() {
		action();
		timeoutId = setTimeout(repeat, currentRate);
		currentRate = Math.max(currentRate * acceleration, minimumRate);
	};
	
	repeat();
};

/**
 * Stop repeating
 */
function stop() {
	clearTimeout(timeoutId);
	currentRate = initialRate;
};
