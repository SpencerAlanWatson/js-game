;
(function (global) {
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
                context.strokeStyle = player.style;
                context.fillStyle = player.style;
                return player.setupCache(new Path2D());


                //context.beginPath();
            };
            wall.setupCache = function (path2d) {

                path2d.rect(wall.x, wall.y, wall.width, wall.height);
                return path2d;
            };

            wall.draw = function (context, path2d) {
                context.save();
                context.translate(player.x, player.y);

                context.rotate(player.rotation);
                path2d = path2d || player.cache;
                // ctx.translate(-60, -25);
                context.stroke(path2d);
                context.moveTo(player.radius / 4, 0);
                context.arc(0, 0, player.radius / 4, 0, (player.tao * player.health / player.maxHealth));
                context.stroke();

                context.restore();
            };
            wall.endBatchDraw = function (context) {
                context.restore();
            };
            wall.cache = player.setupCache(new Path2D());
        } else {
            wall.startBatchDraw = function (context, graphics) {

                context.save();
                context.strokeStyle = player.style;


                context.beginPath();
            };

            wall.draw = function (context) {
                var frontX = player.radius * Math.cos(player.rotation),
                    frontY = player.radius * Math.sin(player.rotation);
                context.save();
                context.moveTo(player.x + frontX, player.y + frontY);

                context.arc(player.x, player.y, player.radius, player.rotation, player.rotation + player.tao);
                context.moveTo(player.x + frontX / 4, player.y + frontY / 4);

                context.arc(player.x, player.y, player.radius / 4, player.rotation, player.rotation + (player.tao * player.health / player.maxHealth));

                context.moveTo(
                    player.x - frontX,
                    player.y - frontY);

                var rotStart = player.rotation - Math.PI / 2,
                    rotEnd = player.rotation + Math.PI / 2;

                context.arc(player.x - frontX, player.y - frontY, player.pointerRadius, rotEnd, rotStart);
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
    global.Game = global.Game || {};
    global.Game.Wall = Wall;
}(this));