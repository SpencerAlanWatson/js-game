;
(function (global) {
    'use strict';

    function Player(playerNumber, x, y, style) {
        var player = {
            x: x,
            y: y,
            playerNumber: playerNumber,

            speed: 3000,
            radius: 10,
            pointerRadius: 4,
            rotation: 0,
            style: style || "black",
            lastFire: -Infinity,
            nextFire: -Infinity,
            slowestFire: 100,
            tag: 'player',
            movement: {
                x: 0,
                y: 0
            },
            tao: Math.PI * 2
        };
        player.startBatchDraw = function (context) {


            context.strokeStyle = player.style;
            context.beginPath();
        };
        player.draw = function (context) {
            var frontX = player.radius * Math.cos(player.rotation),
                frontY = player.radius * Math.sin(player.rotation);

            context.moveTo(player.x + frontX, player.y + frontY);
            context.arc(player.x, player.y, player.radius, player.rotation, player.rotation + player.tao);
            context.moveTo(
                player.x - frontX,
                player.y - frontY);
            var rotStart = player.rotation - Math.PI / 2,
                rotEnd = player.rotation + Math.PI / 2;
            context.arc(player.x - frontX, player.y - frontY, player.pointerRadius, rotEnd, rotStart);
        };
        player.endBatchDraw = function (context) {
            context.stroke();
        };
        player.addMovement = function (dx, dy) {

            player.movement.x += dx;
            player.movement.y += dy;
        };
        player.physicsTick = function (perSecond) {
            player.x += player.movement.x * perSecond;
            player.y += player.movement.y * perSecond;
            player.movement.x = 0;
            player.movement.y = 0;
        };
        player.fireProjectile = function (rate, timestamp) {
            if ( timestamp >= player.lastFire + ((1 - rate) * player.slowestFire)) {
                
                player.lastFire = timestamp ;
                var cos = Math.cos(player.rotation),
                    sin = Math.sin(player.rotation),
                    projectile = Game.Projectile(player.rotation);
                projectile.x = player.x - (player.radius * cos) - (projectile.radius * cos);
                projectile.y = player.y - (player.radius * sin) - (projectile.radius * sin);

                Game.manager.addToAll(projectile, 'projectile');
            }
        }
        player.controlTick = function (event) {
            /* var controls = event.controls,
                mousePos = controls.getMousePosition(),
                dirX = player.x - mousePos.x,
                dirY = player.y - mousePos.y;

            player.rotation = Math.atan2(dirY, dirX);*/
            var controls = event.controls,
                axes = event.axes,
                buttons = event.buttons,
                dirX = -axes[2],
                dirY = -axes[3];

            player.addMovement(player.speed * axes[0], player.speed * axes[1]);

            if ((dirX > 0.01 || dirX < -0.01) || (dirY > 0.01 || dirY < -0.01))
                player.rotation = Math.atan2(dirY, dirX);

            if (buttons[6].pressed) {
                player.fireProjectile(buttons[6].value, event.timestamp);
            }
        };
        player.bindControls = function (controls) {
            var id = player.playerNumber,
                type = id + 'Hold';
            controls.addEventListener('up' + type, function (event) {
                player.addMovement(0, -player.speed);
            });
            controls.addEventListener('down' + type, function (event) {
                player.addMovement(0, player.speed);

            });
            controls.addEventListener('left' + type, function (event) {
                player.addMovement(-player.speed, 0);
            });
            controls.addEventListener('right' + type, function (event) {
                player.addMovement(player.speed, 0);
            });

            controls.addEventListener('fire' + id + "Press", player.fireProjectile);

            controls.addEventListener('controltick', player.controlTick);
        }
        player.collide = function (object) {
            if (object.tag !== 'object' || object.parent !== player) {
                var dX = player.x - object.x,
                    dY = player.y - object.y,
                    angleTo = Math.atan2(dY, dX),
                    midX = (player.x + object.x) / 2,
                    midY = (player.y + object.y) / 2;

                /*sideX = object.x + (object.radius * Math.cos(angleTo)),
                    sideY = object.y + (object.radius * Math.sin(angleTo)),
                    centerX = sideX + (player.radius * Math.cos(angleTo)),
                    centerY = sideY + (player.radius * Math.sin(angleTo));*/


                /*sideDX = sideX - object.x,
                    sideDY = sideY - object.y,
                    distance = Math.sqrt(sideDX * sideDX + sideDY * sideDY),
                    diffDist = object.radius - distance;*/


                player.x = midX + (player.radius * Math.cos(angleTo)); //centerX;
                player.y = midY + (player.radius * Math.sin(angleTo)); //centerX;
                object.x = midX - (object.radius * Math.cos(angleTo)); //centerX;
                object.y = midY - (object.radius * Math.sin(angleTo));
            }
        };
        return player;
    }
    global.Game = global.Game || {};
    global.Game.Player = Player;
}(this));