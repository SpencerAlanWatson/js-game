;
(function (global, undefined) {
    'use strict';

    function Player(playerNumber, x, y, style) {
        var player = _.create(v2(x, y), {
            playerNumber: playerNumber,

            speed: 300,
            radius: 25,
            pointerRadius: 4,
            rotation: 0,
            style: style || "#ffffff",
            lastFire: -Infinity,
            slowestFire: 50,
            mass: 1,
            tag: 'player',
            batchName: 'player',
            gravity: false,
            health: 400,
            maxHealth: 400,
            movement: v2(0, 0),
            hpBarStyles: ["white", "blue", "lightgreen", "darkred", 'yellow'],
            tao: Math.PI * 2
        });
        player.hpBarRadius = player.radius -2;
        player.uid = _.uniqueId(player.tag);

        if (Path2D !== undefined) {
            player.startBatchDraw = function (context) {

                context.save();
                context.strokeStyle = player.style;
                context.fillStyle = player.style;
                context.lineWidth = 2.5;
                context.font = player.hpBarRadius + "px Roboto Condensed";
                context.textAlign = 'center';
                context.textBaseline = "middle";
                context.beginPath();
                return player.setupCache(new Path2D());


                //context.beginPath();
            };
            player.setupCache = function (path2d) {

                //path2d.arc(0, 0, player.radius, 0, Math.PI * 2);
                //path2d.moveTo(player.hpBarRadius, 0);
                //path2d.arc(0, 0, player.hpBarRadius, 0, (player.tao * player.health / player.maxHealth));

                path2d.moveTo(-player.radius, 0);

                path2d.arc(-player.radius, 0, player.pointerRadius, Math.PI / 2, -Math.PI / 2);
                return path2d;
            };

            player.draw = function (context, path2d) {
                context.save();
                context.translate(player.x, player.y);

                context.rotate(player.rotation);
                path2d = path2d || player.cache;
                // ctx.translate(-60, -25);
                context.stroke(path2d);
                context.moveTo(player.hpBarRadius, 0);
                if (player.health > 0) {
                    let perc = player.health % 100 / 100;
                    if (perc === 0) {


                        context.strokeStyle = player.hpBarStyles[player.health / 100];
                        context.arc(0, 0, player.hpBarRadius, 0, player.tao, false);
                    } else if (player.health / 100 < 1) {
                        context.strokeStyle = player.hpBarStyles[1];
                        context.beginPath();
                        context.arc(0, 0, player.hpBarRadius, 0, player.tao * perc, false);
                        context.closePath();
                    } else {
                        let endAngle = player.tao * perc;

                        context.strokeStyle = player.hpBarStyles[Math.floor(player.health / 100)];

                        context.beginPath();
                        context.arc(0, 0, player.hpBarRadius, 0, endAngle, true);
                        context.closePath();
                        context.stroke();
                        context.beginPath();
                        context.strokeStyle = player.hpBarStyles[Math.ceil(player.health / 100)];
                        context.arc(0, 0, player.hpBarRadius, 0, endAngle, false);
                        context.closePath();



                    }
                    context.stroke();

                }
                context.strokeStyle = player.style;
                context.beginPath();
                context.fillText(player.health, 0, 0);
                context.restore();
            };
            player.endBatchDraw = function (context) {
                context.restore();
            };
            player.cache = player.setupCache(new Path2D());
        } else {
            player.startBatchDraw = function (context, graphics) {

                context.save();
                context.strokeStyle = player.style;


                context.beginPath();
            };

            player.draw = function (context) {
                var frontX = player.radius * Math.cos(player.rotation),
                    frontY = player.radius * Math.sin(player.rotation);
                context.save();
                context.moveTo(player.x + frontX, player.y + frontY);

                context.arc(player.x, player.y, player.radius, player.rotation, player.rotation + player.tao);
                context.moveTo(player.x + frontX / 3, player.y + frontY / 3);

                context.arc(player.x, player.y, player.hpBarRadius, player.rotation, player.rotation + (player.tao * player.health / player.maxHealth));

                context.moveTo(
                    player.x - frontX,
                    player.y - frontY);

                var rotStart = player.rotation - Math.PI / 2,
                    rotEnd = player.rotation + Math.PI / 2;

                context.arc(player.x - frontX, player.y - frontY, player.pointerRadius, rotEnd, rotStart);
                context.restore();
            };
            player.endBatchDraw = function (context) {
                context.stroke();

                context.restore();
            };


        }

        player.addMovement = function (dx, dy) {

            player.movement.x += dx;
            player.movement.y += dy;
        };
        player.physicsTick = function (perSecond) {
            player.x += player.movement.x; //* perSecond;
            player.y += player.movement.y; //* perSecond;
            player.movement.x = 0;
            player.movement.y = 0;
            /*if (player.playerNumber >= 1) {
                //var dy = player.y - Game.manager.objects[0].y;
                player.rotation = player.angleTo(Game.manager.objects[0]); //dy < 0 ? player.angleTo(Game.manager.objects[0]) : player.angleTo(player.sub(Game.manager.objects[0]));
                player.fireProjectile(1, performance.now());
            }*/
        };
        player.fireProjectile = function (rate, timestamp) {
            if (timestamp >= player.lastFire + ((1 - rate) * player.slowestFire + 120)) {

                player.lastFire = timestamp;
                let cos = Math.cos(player.rotation),
                    sin = Math.sin(player.rotation);

                Game.manager.add(Game.Projectile(
                    player.rotation,
                    4,
                    player.x - (player.radius * cos) - (4 * cos) - (player.pointerRadius * cos),
                    player.y - (player.radius * sin) - (4 * sin) - (player.pointerRadius * sin)
                ));
            }
        };
        player.getPoints = function () {
            return [v2(player.x, player.y)];
        };
        player.getAxes = function (oPoints) {
            _.each(oPoints, function (point) {

            });
        };
        player.controlTick = function (event) {
            /* var controls = event.controls,
                mousePos = controls.getMousePosition(),
                dirX = player.x - mousePos.x,
                dirY = player.y - mousePos.y;

            player.rotation = Math.atan2(dirY, dirX);*/
            var controls = event.controls,
                input = event.input,
                controllerIndex = event.controllerIndex,
                perSec = event.tickDelta / 1000;

            if (controllerIndex == -1) {
                let dirX = player.x - event.mouseCoords.x,
                    dirY = player.y - event.mouseCoords.y;
                player.rotation = Math.atan2(dirY, dirX);
            } else {
                if (input['lookV'].pressed || input['lookH'].pressed) {
                    player.rotation = Math.atan2(-input['lookV'].value, -input['lookH'].value);
                }
            }

            player.addMovement(player.speed * input['moveH'].value * perSec, player.speed * input['moveV'].value * perSec);

            if (input['fire'].pressed) {
                player.fireProjectile(input['fire'].value, event.timestamp);
            }


        };
        player.setupListeners = function (eventEmitters) {
            var id = player.playerNumber;

            eventEmitters.physics.addEventListener('physicsTick', player.physicsTick);
            eventEmitters.controls.addEventListener('control-tick-p' + id, player.controlTick);
        };
        player.removeListeners = function (eventEmitters) {
            var id = player.playerNumber;

            eventEmitters.physics.removeEventListener('physicsTick', player.physicsTick);
            eventEmitters.controls.removeEventListener('control-tick-p' + id, player.controlTick);
        };
        player.collide = function (object) {
            if ((object.tag !== 'object' || object.parent !== player) && object.tag !== 'projectile') {
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
            if (object.tag === 'projectile') {
                player.health -= object.damage;
            }
        };
        return player;
    }
    global.Game = global.Game || {};
    global.Game.Player = Player;
}(this));