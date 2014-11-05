;
(function (global) {
    'use strict';

    function Physics() {
        var physics = {
                objects: [],
                physicsId: 0,
                lastTimestamp: global.performance.now()
            },
            stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms


        document.getElementById('stats-container').appendChild(stats.domElement);

        physics.addObject = function (object) {
            if (object)
                physics.objects.push(object);
        };
        physics.removeObject = function (object) {
            if(object){ 
                var index = physics.objects.indexOf(object);
                if(index !== -1) {
                    physics.objects.splice(index, 1);   
                }
            }
        };
        physics.start = function () {
            cancelAnimationFrame(physics.physicsId);
            physics.physicsId = requestAnimationFrame(physics.tick);
        };
        physics.stop = function () {
            cancelAnimationFrame(physics.physicsId);
        };
        physics.tick = function (timestamp) {
            physics.physicsId = requestAnimationFrame(physics.tick);
            stats.begin();
            var perSecond = (timestamp - physics.lastTimestamp) / 1000;
            physics.lastTimestamp = timestamp;

            _.invoke(physics.objects, 'physicsTick', perSecond);
            physics.testCollisions();
            stats.end();

        };
        
        physics.testCollisions = function () {
            var length = physics.objects.length - 1;
            for (var index = 0; index < length; ++index) {
                var firstObj = physics.objects[index]
                for (var index2 = index + 1; index2 <= length; ++index2) {
                    var secondObj = physics.objects[index2];
                    var dx = firstObj.x - secondObj.x;
                    var dy = firstObj.y - secondObj.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < firstObj.radius + secondObj.radius) {
                        firstObj.collide(secondObj);
                        secondObj.collide(firstObj);
                    }
                };
            }
        };
        physics.physicsId = requestAnimationFrame(physics.tick);

        return physics;
    };
    global.Game = global.Game || {};
    global.Game.Physics = Physics;
}(this));