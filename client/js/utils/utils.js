;
define(['vendor/lodash'], function (_, undefined) {
    'use strict';

    function MathFuncs() {
        const Tao = Math.PI * 2;
        return {
            Tao: Tao,
            Clamp: function (value, min, max) {
                return (value < min) ? min : ((value > max) ? max : value);
            }
        };
    };

    function RequestFrame() {
        var requestFrame = Object.create(null);

        requestFrame.start = function (callback, fps) {
            var delay = fps ? 1000 / fps : 0;
            return setTimeout(function tick() {
                callback(function nextTick(stop) {
                    if (stop) return;
                    return setTimeout(tick, delay);
                }, _.now());
            }, delay);
        };

        requestFrame.stop = function (requestId) {
            clearTimeout(requestId);
        };
        return requestFrame;
    };
    return {
        Math: MathFuncs(),
        requestFrame: RequestFrame()
    };
});