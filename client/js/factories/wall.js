;
define(['vendor/lodash','v2', 'utils'], function (_, v2, Utils, undefined) {
    'use strict';

    function Wall(x, y, width, height) {
        var wall = _.create(v2(x, y), {
            width: width,
            height: height,
            radius: 15,
            rotation: 0,
            style: style || "black",
            mass: 1,
            tag: 'wall',
            batchName: 'wall',
            gravity: false,
        });
        wall.uid = _.uniqueId(wall.tag)

        
        if (Path2D !== undefined) {
            wall.startBatchDraw = function (context) {

                context.save();
                context.strokeStyle = wall.style;
                context.fillStyle = wall.style;
                return wall.setupCache(new Path2D());


                //context.beginPath();
            };
            wall.setupCache = function (path2d) {

                path2d.rect(wall.x, wall.y, wall.width, wall.height);
                return path2d;
            };

            wall.draw = function (context, path2d) {
                context.save();
                context.translate(wall.x, wall.y);

                context.rotate(wall.rotation);
                path2d = path2d || wall.cache;
                // ctx.translate(-60, -25);
                context.stroke(path2d);
                context.moveTo(wall.radius / 4, 0);
                context.arc(0, 0, wall.radius / 4, 0, (Utils.Math.Tao * wall.health / wall.maxHealth));
                context.stroke();

                context.restore();
            };
            wall.endBatchDraw = function (context) {
                context.restore();
            };
            wall.cache = wall.setupCache(new Path2D());
        } else {
            wall.startBatchDraw = function (context, graphics) {

                context.save();
                context.strokeStyle = wall.style;


                context.beginPath();
            };

            wall.draw = function (context) {
                var frontX = wall.radius * Math.cos(wall.rotation),
                    frontY = wall.radius * Math.sin(wall.rotation);
                context.save();
                context.moveTo(wall.x + frontX, wall.y + frontY);

                context.arc(wall.x, wall.y, wall.radius, wall.rotation, wall.rotation + Utils.Math.Tao);
                context.moveTo(wall.x + frontX / 4, wall.y + frontY / 4);

                context.arc(wall.x, wall.y, wall.radius / 4, wall.rotation, wall.rotation + (Utils.Math.Tao * wall.health / wall.maxHealth));

                context.moveTo(
                    wall.x - frontX,
                    wall.y - frontY);

                var rotStart = wall.rotation - Math.PI / 2,
                    rotEnd = wall.rotation + Math.PI / 2;

                context.arc(wall.x - frontX, wall.y - frontY, wall.pointerRadius, rotEnd, rotStart);
                context.restore();
            };
            wall.endBatchDraw = function (context) {
                context.stroke();

                context.restore();
            };


        }

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
    return Wall;
});