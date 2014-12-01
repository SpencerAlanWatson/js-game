;
(function (global, undefined) {
    'use strict';

    function TestAI(playerNumber) {
        var ai = {
            playerNumber: playerNumber,
            targetNumber: 0,
            id: 'Test AI controller',
            index: _.uniqueId('ai'),
            rotation: 0,
            rotateAmount: Math.PI / 4,
            noDraw: true
        };

        ai.physicsTick = function (event) {

            var perSecond = event.perSecond,
                controls = Game.manager.controls,
                player = Game.manager.objects[ai.playerNumber],
                target = Game.manager.objects[ai.targetNumber];

            if (player && target) {
                var angle = player.angleTo(target);



                controls.setInput(ai.index, 'lookH', {
                    value: -Math.cos(angle),
                    pressed: true
                });
                controls.setInput(ai.index, 'lookV', {
                    value: -Math.sin(angle),
                    pressed: true
                });
                controls.setInput(ai.index, 'fire', {
                    value: 1,
                    pressed: true
                });
            };

        };
        ai.setupListeners = function (eventEmitters) {
            var controls = eventEmitters.controls;
            controls.addController(ai, true);
            controls.addPlayerToController(ai.playerNumber, ai.index);

            eventEmitters.physics.addEventListener('physicsTick', ai.physicsTick);
            controls.setInput(ai.index, 'lookH', {
                value: 1,
                pressed: true
            });


        };
        ai.removeListeners = function (eventEmitters) {


            eventEmitters.physics.removeEventListener('physicsTick', ai.physicsTick);
            var controls = eventEmitters.controls;
            controls.removeController(ai, true);
            //controls.removePlayerFromController(ai.player.playerNumber, ai.controllerIndex);
        };
        return ai;
    }
    global.Game = global.Game || {};
    global.Game.TestAI = TestAI;
}(isNodejs ? global : window));