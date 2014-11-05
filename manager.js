;
(function (global) {
    'use strict';

    function Manager(height, width) {
        var manager = {
            graphics: Game.Graphics(height, width),
            physics: Game.Physics()
        };
        manager.controls = Game.Controls(manager.graphics.screenCanvas);

        manager.start = function () {
            manager.graphics.start();
            manager.physics.start();
            manager.controls.start();
        };
        manager.stop = function () {
            manager.graphics.stop();
            manager.physics.stop();
            manager.controls.stop();
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