;
(function (global) {
    'use strict';

    function Projectile(angle, x, y) {
        var projectile = {
            x: x || 0,
            y: y || 0,
            angle: angle || 0,
            radius: 4,
            tag: 'projectile',
            style: "red",
            tao: Math.PI * 2,
            baseSpeed: 600
        };
        projectile.movement = {
            x: projectile.baseSpeed * -Math.cos(projectile.angle),
            y: projectile.baseSpeed * -Math.sin(projectile.angle)
        };

        projectile.startBatchDraw = function (context) {


            context.fillStyle = projectile.style;
            context.beginPath();
        };
        projectile.draw = function (context) {
            context.moveTo(projectile.x, projectile.y);
            context.arc(projectile.x, projectile.y, projectile.radius, 0, projectile.tao);
        };
        projectile.endBatchDraw = function (context) {
            context.fill();
        };
        
        projectile.physicsTick = function (perSecond) {
            projectile.x += projectile.baseSpeed * -Math.cos(projectile.angle) * perSecond;
            projectile.y += projectile.baseSpeed * -Math.sin(projectile.angle) * perSecond;

        };
        projectile.collide = function (object) {
            //console.count(object.tag);
            if (object.tag === 'player') {
                //Game.manager.removeFromAll(projectile, projectile.tag);   
            }
        };
        return projectile;
    };
    global.Game = global.Game || {};
    global.Game.Projectile = Projectile;
}(this));