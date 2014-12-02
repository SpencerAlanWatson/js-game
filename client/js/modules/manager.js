;
define(['vendor/lodash','state', 'controls', 'physics', 'graphics'], function (_, state, Controls, Physics, Graphics, undefined) {
    'use strict';
    state.playerCount = 0;
    state.playerTotal = 2;
    var manager = {

        objects: []
    };

    manager.init = function (width, height) {
        manager.eventEmitters = {};

        manager.physics = Physics();
        if (isNodejs) {
            manager.controls = Controls();

        } else {
            manager.graphics = Graphics(width, height);
            manager.controls = Controls(manager.graphics.screenCanvas, manager.graphics.screenCanvas.parentElement).bind();
            manager.eventEmitters.graphics = manager.graphics;

        }
        manager.eventEmitters.controls = manager.controls;
        manager.eventEmitters.physics = manager.physics;

        return manager;
    };
    manager.start = function () {
        if (!isNodejs)
            manager.graphics.start();
        manager.physics.start(manager.objects);
        manager.controls.start();

        return manager;
    };
    manager.stop = function () {
        if (!isNodejs)
            manager.graphics.stop();
        manager.physics.stop();
        manager.controls.stop();
        return manager;
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
        if (isNodejs) return;
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
        if (isNodejs) return;

        if (batchName)
            manager.graphics.removeFromBatch(batchName, object);
        else
            manager.graphics.removeBatchless(object);
    };
    manager.removeFromPhysics = function (object) {
        manager.physics.removeObject(object);
    };
    return manager;
});