;
define(['util/utils'], function (Utils, undefined) {
    'use strict';

    function Box(x, y) {
        var box = {
            x: x,
            y: y,

            radius: 7,
            rotation: 0,
            parent: null,
            style: "blue",
            tag: 'box'
        };
        box.startBatchDraw = function (context) {


            context.strokeStyle = box.style;
            context.beginPath();
        };
        box.draw = function (context) {
            var frontX = box.radius * Math.cos(box.rotation),
                frontY = box.radius * Math.sin(box.rotation);

            context.moveTo(box.x + frontX, box.y + frontY);
            context.arc(box.x, box.y, box.radius, box.rotation, box.rotation + Utils.Math.Tao);
            context.moveTo(
                box.x - frontX,
                box.y - frontY);
            var rotStart = box.rotation - Math.PI / 2,
                rotEnd = box.rotation + Math.PI / 2;
            context.arc(box.x - frontX, box.y - frontY, box.pointerRadius, rotEnd, rotStart);
        };
        box.endBatchDraw = function (context) {
            context.stroke();
        };
        box.physicsTick = function () {
            /*player.x += player.movement.x;
        player.y += player.movement.y;
        player.movement.x = 0;
        player.movement.y = 0;*/
            if (box.parent) {
                var parent = box.parent,
                    xDir = Math.cos(parent.rotation),
                    yDir = Math.sin(parent.rotation);

                box.x = parent.x + parent.radius + box.radius; //(-box.radius * xDir) + parent.x + (parent.radius * xDir);
                box.y = parent.y + parent.radius + box.radius; //(-box.radius * yDir) + parent.y + (parent.radius * yDir);

            }
        };
        box.bindControls = function (controls) {

        };
        box.collide = function (object) {
            if (object.tag === 'player' && box.parent === null) {
                box.parent = boxect;
            } else if (object !== box.parent) {
                var dX = box.x - object.x,
                    dY = box.y - object.y,
                    angleTo = Math.atan2(dY, dX),
                    midX = (box.x + object.x) / 2,
                    midY = (box.y + object.y) / 2;




                box.x = midX + (box.radius * Math.cos(angleTo)); //centerX;
                box.y = midY + (box.radius * Math.sin(angleTo)); //centerX;
                object.x = midX - (object.radius * Math.cos(angleTo)); //centerX;
                object.y = midY - (object.radius * Math.sin(angleTo));
            }

        };
        return box;
    };
    return Box;
});