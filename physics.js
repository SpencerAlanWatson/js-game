;
(function (global) {
    'use strict';

    function Physics() {
        var physics = {
                objects: [],
                physicsId: 0,
                lastTimestamp: global.performance.now(),
                G: 6.67484e-6,
            },
            stats = new Stats();
        EventDispatcher.prototype.apply(physics);



        stats.setMode(0); // 0: fps, 1: ms


        document.getElementById('stats-container').appendChild(stats.domElement);

        physics.addObject = function (object) {
            if (object)
                physics.objects.push(object);
        };
        physics.removeObject = function (object) {
            if (object) {
                console.count(object.uid);
                var index = physics.objects.indexOf(object);
                delete physics.objects[index];

                if (index !== -1) {
                    let removed = physics.objects.splice(index, 1);
                    delete removed[0];
                }
            }
        };
        physics.start = function (objects) {

            cancelAnimationFrame(physics.physicsId);
            physics.physicsId = requestAnimationFrame(physics.tick);
            physics.objects = objects;
        };
        physics.stop = function () {
            cancelAnimationFrame(physics.physicsId);
        };
        physics.tick = function (timestamp) {
            physics.physicsId = requestAnimationFrame(physics.tick);
            stats.begin();
            var perSecond = (timestamp - physics.lastTimestamp) / 1000;
            physics.lastTimestamp = timestamp;

            var length = physics.objects.length - 1;
            /*_.each(physics.objects, function (firstObj, index, list) {
                _.each(list, function (secondObj, index2, list2) {
                    if(firstObj === secondObj) return;
                    let dx = firstObj.x - secondObj.x,
                        dx2 = secondObj.x - firstObj.x,
                        dy = firstObj.y - secondObj.y,
                        dy2 = secondObj.y - firstObj.y,
                        distanceSqrd = dx * dx + dy * dy;

                    if (firstObj.gravity && secondObj.gravity) {
                        let gForce = (physics.G * firstObj.mass * secondObj.mass) / distanceSqrd,
                            fX = gForce * Math.cos(dx),
                            fY = gForce * Math.sin(dy);

                        firstObj.forceVector.x += gForce * Math.cos(dx);
                        firstObj.forceVector.y += gForce * Math.sin(dy);

                        secondObj.forceVector.x += gForce * Math.cos(dx2);
                        secondObj.forceVector.y += gForce * Math.sin(dy2);
                    }
                    if (Math.sqrt(distanceSqrd) < firstObj.radius + secondObj.radius) {
                        console.log(firstObj.tag + ' collides with ' + secondObj.tag);
                        firstObj.collide(secondObj);
                        secondObj.collide(firstObj);
                    }
                });
            });*/
            for (let index = 0; index < length; ++index) {
                let firstObj = physics.objects[index];

                for (let index2 = index + 1; index2 <= length; ++index2) {
                    let secondObj = physics.objects[index2],
                        dx = firstObj.x - secondObj.x,
                        dx2 = secondObj.x - firstObj.x,
                        dy = firstObj.y - secondObj.y,
                        dy2 = secondObj.y - firstObj.y,
                        distanceSqrd = dx * dx + dy * dy;

                    if (firstObj.gravity && secondObj.gravity) {
                        let gForce = (physics.G * firstObj.mass * secondObj.mass) / distanceSqrd,
                            fX = gForce * Math.cos(dx),
                            fY = gForce * Math.sin(dy);

                        firstObj.forceVector.x += gForce * Math.cos(dx);
                        firstObj.forceVector.y += gForce * Math.sin(dy);

                        secondObj.forceVector.x += gForce * Math.cos(dx2);
                        secondObj.forceVector.y += gForce * Math.sin(dy2);
                    }
                    
                   // let axes = firstObj.getAxes()
                    if (Math.sqrt(distanceSqrd) < firstObj.radius + secondObj.radius) {
                        console.log(firstObj.tag + ' collides with ' + secondObj.tag);
                        firstObj.collide(secondObj);
                        secondObj.collide(firstObj);
                    }
                }
            }

            //_.invoke(physics.objects, 'physicsTick', perSecond);
            physics.dispatchEvent({
                type: 'physicsTick',
                perSecond: perSecond
            });
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
                }
            }
        };
        physics.testCollision = function (firstObject, secondObject) {
            var dx = firstObject.x - secondObject.x;
            var dy = firstObject.y - secondObject.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < firstObject.radius + secondObject.radius) {
                firstObject.collide(secondObject);
                secondObject.collide(firstObject);
            }
        };
        physics.physicsId = requestAnimationFrame(physics.tick);

        return physics;
    };
    global.Game = global.Game || {};
    global.Game.Physics = Physics;
}(this));