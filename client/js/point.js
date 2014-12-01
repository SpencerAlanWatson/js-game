;
define([], function (undefined) {
    'use strict';

    function vec2(x, y) {
        var v2 = {
            x: x || 0,
            y: y || 0
        };
        v2.clone = function () {
            return vec2(v2.x, v2.y);
        };

        v2.add = function (v, y) {
            if (typeof v === "object") {
                return vec2(v2.x + v.x, v2.y + v.y);
            } else if (!isNaN(parseFloat(v))) {
                y = y || 0;
                return vec2(v2.x + parseFloat(v), v2.y + parseFloat(y));
            }
        };
        v2.sub = function (v, y) {
            if (typeof v === "object") {
                return vec2(v2.x - v.x, v2.y - v.y);
            } else if (!isNaN(parseFloat(v))) {
                y = y || 0;
                return vec2(v2.x - parseFloat(v), v2.y - parseFloat(y));
            }
        };
        v2.addSelf = function (v, y) {
            if (typeof v === "object") {
                v2.x += v.x;
                v2.y += v.y;
            } else if (!isNaN(parseFloat(v))) {
                y = y || 0;
                v2.x += v;
                v2.y += y;
            }
            return v2;
        };
        v2.subSelf = function (v, y) {
            if (typeof v === "object") {
                v2.x -= v.x;
                v2.y -= v.y;
            } else if (!isNaN(parseFloat(v))) {
                y = y || 0;

                v2.x -= v;
                v2.y -= y;
            }
            return v2;
        };
        v2.dot = function (v) {
            return v2.x * v.x + v2.y * v.y;
        };
        v2.lengthSq = function () {
            return v2.x * v2.x + v2.y * v2.y;
        };
        v2.length = function () {
            return Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        };
        v2.normal = function () {
            var length = v2.length();
            return vec2(v2.x / length, v2.y / length);
        };
        v2.angleTo = function (v) {
            //var diff =  v.sub(v2).normal();

            //var cosA = v2.dot(v) / (v2.length() * v.length()),
            //    clamped = (cosA < -1) ? -1 : ((cosA > 1) ? 1 : cosA);

            //We do this to prevent NaN 
            //return Math.acos(clamped);


            return Math.atan2(v2.y - v.y, v2.x - v.x);
        };
        v2.distanceToSq = function (v) {
            var dx = v.x - v2.x,
                dy = v.y - v2.y;
            return dx * dx + dy * dy;
        };
        v2.distanceTo = function (v) {
            var dx = v.x - v2.x,
                dy = v.y - v2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        v2.rotateAround = function (center, angle) {
            //TODO: Test this!
            var radius = v2.sub(center).length();
            return vec2(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
        };
        v2.rotateSelfAround = function (center, angle) {
            var length = v2.sub(center).length();
            v2.x = length * Math.cos(angle);
            v2.y = length * Math.sin(angle);
            return v2;
        }
        return v2;
    }
    return vec2;
});