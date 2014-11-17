;
(function (global) {
    'use strict';

    function Wall(x, y, width, height) {
        var wall = {
            x: x,
            y: y,

            speed: 300,
            radius: 15,
            pointerRadius: 4,
            rotation: 0,
            style: style || "black",
            mass: 1,
            tag: 'wall',
            batchName: 'wall',
            gravity: false,
            tao: Math.PI * 2
        };
        wall.uid = _.uniqueId(wall.tag)

        wall.startBatchDraw = function (context) {
            context.strokeStyle = wall.style;
            context.beginPath();
        };
        wall.draw = function (context) {
            var frontX = wall.radius * Math.cos(wall.rotation),
                frontY = wall.radius * Math.sin(wall.rotation);

            context.moveTo(wall.x + frontX, wall.y + frontY);

            context.arc(wall.x, wall.y, wall.radius, wall.rotation, wall.rotation + wall.tao);
            context.moveTo(wall.x + frontX / 4, wall.y + frontY / 4);

            context.arc(wall.x, wall.y, wall.radius / 4, wall.rotation, wall.rotation + (wall.tao * wall.health / wall.maxHealth));

            context.moveTo(
                wall.x - frontX,
                wall.y - frontY);

            var rotStart = wall.rotation - Math.PI / 2,
                rotEnd = wall.rotation + Math.PI / 2;

            context.arc(wall.x - frontX, wall.y - frontY, wall.pointerRadius, rotEnd, rotStart);
        };
        wall.endBatchDraw = function (context) {
            context.stroke();
        };


        wall.physicsTick = function (perSecond) {
            wall.x += wall.movement.x; //* perSecond;
            wall.y += wall.movement.y; //* perSecond;
            wall.movement.x = 0;
            wall.movement.y = 0;
        };
        wall.setupListeners = function (eventEmitters) {

            eventEmitters.physics.addEventListener('physicsTick', wall.physicsTick);
        };
        wall.removeListeners = function (eventEmitters) {

            eventEmitters.physics.removeEventListener('physicsTick', wall.physicsTick);
        };
        wall.collide = function (object) {
            
        };
        wall.getAxes = function() {
            
        }
        return wall;
    }
    global.Game = global.Game || {};
    global.Game.Wall = Wall;
}(this));