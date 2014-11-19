;
(function (global) {
    'use strict';

    function Manager(width, height) {
        var manager = {
            graphics: Game.Graphics(width, height).initialize(),
            physics: Game.Physics(),
            objects: [],

        };
        manager.controls = Game.Controls(manager.graphics.screenCanvas, manager.graphics.screenCanvas.parentElement);
        manager.eventEmitters = {
            graphics: manager.graphics,
            physics: manager.physics,
            controls: manager.controls
        };

        manager.start = function () {
            manager.graphics.start();
            manager.physics.start(manager.objects);
            manager.controls.start();
        };
        manager.stop = function () {
            manager.graphics.stop();
            manager.physics.stop();
            manager.controls.stop();
        };

        function add(object) {
            if (object.setupListeners)
                object.setupListeners(manager.eventEmitters);
            manager.objects.push(object);
            manager.addToGraphics(object, object.batchName ? object.batchName : false);
        }

        function remove(object) {
            let undefined;
            if (object !== undefined) {
                var index = manager.objects.indexOf(object),
                    batchName = object.batchName ? object.batchName : false;
                if (object.removeListeners)
                    object.removeListeners(manager.eventEmitters);

                manager.removeFromGraphics(object, batchName);
                //manager.removeFromPhysics(object);

                delete manager.objects[index];
                if (index !== -1) {
                    let removed = manager.objects.splice(index, 1);
                    delete removed[0];
                }
                if (object.destroy)
                    object.destroy();
            }
        }
        manager.add = function (object) {
            _.defer(add, object);
        }
        manager.remove = function (object) {
            _.defer(remove, object);
        };

        manager.addToAll = function (object, batchName) {
            manager.addToGraphics(object, batchName);

            manager.addToPhysics(object);
        };
        manager.addToGraphics = function (object, batchName) {
            if (batchName)
                manager.graphics.addToBatch(batchName, object);
            else
                manager.graphics.addBatchless(object);
        };
        manager.addToPhysics = function (object) {
            manager.physics.addObject(object);
        };

        manager.removeFromAll = function (object, batchName) {
            manager.removeFromGraphics(object, batchName);

            manager.removeFromPhysics(object);
        };
        manager.removeFromGraphics = function (object, batchName) {
            if (batchName)
                manager.graphics.removeFromBatch(batchName, object);
            else
                manager.graphics.removeBatchless(object);
        };
        manager.removeFromPhysics = function (object) {
            manager.physics.removeObject(object);
        };
        return manager;
    };

    global.Game = global.Game || {};
    global.Game.Manager = Manager;
}(this));