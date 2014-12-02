;
(function (global, undefined) {
    'use strict';

    function Projectile(angle, radius, x, y) {

        var projectile = _.assign(v2(x, y), {
            angle: angle || 0,
            radius: radius || 4,
            tag: 'projectile',
            batchName: 'projectile',
            removed: false,
            style: "red",
            tao: Math.PI * 2,
            mass: 1e5,
            baseSpeed: 1200,
            damage: 10,
            gravity: false,
        });
        projectile.uid = _.uniqueId(projectile.tag)

        projectile.forceVector = v2(0, 0);
        projectile.acclerationVector = v2(projectile.baseSpeed * -Math.cos(projectile.angle), projectile.baseSpeed * -Math.sin(projectile.angle));

        if (typeof Path2D !== 'undefined') {
            projectile.startBatchDraw = function (context) {
                context.save();
                context.fillStyle = projectile.style;
                return projectile.setupPath(new Path2D());
            };
            projectile.draw = function (context, path2d) {
                context.save();
                context.translate(projectile.x, projectile.y);
                path2d = path2d || projectile.Path2D;
                context.fill(path2d);
                context.restore();
            };
            projectile.endBatchDraw = function (context) {
                context.restore();
            };
            projectile.setupPath = function (path2d) {
                path2d.arc(0, 0, projectile.radius, 0, projectile.tao);
                return path2d;
            };
            projectile.Path2D = projectile.setupPath(new Path2D());
            
        } else {
            projectile.startBatchDraw = function (context) {
                context.save();
                context.fillStyle = projectile.style;
                context.beginPath();
            };
            projectile.draw = function (context) {

                context.moveTo(projectile.x, projectile.y);
                context.arc(projectile.x, projectile.y, projectile.radius, 0, projectile.tao);
            };
            projectile.endBatchDraw = function (context) {
                context.fill();
                context.restore();
            };
        }

        projectile.physicsTick = function (event) {
            var perSecond = event.perSecond;
            projectile.acclerationVector.addSelf(projectile.forceVector);
            projectile.addSelf(projectile.acclerationVector.x * perSecond, projectile.acclerationVector.y * perSecond);

            if (projectile.x < -projectile.radius * 2 || projectile.x > window.innerWidth + projectile.radius * 2 || projectile.y < -projectile.radius * 2 || projectile.y > window.innerHeight + projectile.radius * 2) {
                Game.manager.remove(projectile);
                projectile.removed = true;
            } else {

                projectile.forceVector.x = 0;
                projectile.forceVector.y = 0;
            }

        };
        projectile.collide = function (object) {
            //console.count(object.tag);
            if (object.tag === 'player') {
                // console.count(projectile.uid);

                //console.log('collision with player', object);
                Game.manager.remove(projectile);
                projectile.removed = true;
            }
        };

        projectile.setupListeners = function (eventEmitters) {
            eventEmitters.physics.addEventListener('physicsTick', projectile.physicsTick);
        };
        projectile.removeListeners = function (eventEmitters) {
            eventEmitters.physics.removeEventListener('physicsTick', projectile.physicsTick);
        };
        projectile.destroy = function () {
            for (let index in projectile) {
                delete projectile[index];
            }
            let undefined;
            projectile = undefined;
        }
        return projectile;
    };
    global.Game = global.Game || {};
    global.Game.Projectile = Projectile;
}(this));
