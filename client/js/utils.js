;
(function (global, undefined) {
    'use strict';

    function MathFuncs() {
        return {
            Clamp: function (value, min, max) {
                return (value < min) ? min : ((value > max) ? max : value);
            }
        };
    };

    global.Game = global.Game || {};
    global.Game.Math = MathFuncs();
}(isNodejs ? global : window));