;
(function (global) {
    'use strict';

    function Graphics(height, width) {
        var graphics = {},
            stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        document.getElementById('stats-container').appendChild(stats.domElement);


        graphics.running = false;
        graphics.height = height;
        graphics.width = width;
        graphics.batchlessObjects = [];
        graphics.batchObjects = {};

        graphics.createCanvas = function (height, width) {
            var canvas = document.createElement('canvas');
            canvas.height = height;
            canvas.width = width;
            return canvas;
        };
        graphics.screenCanvas = graphics.createCanvas(height, width);
        graphics.screenContext = graphics.screenCanvas.getContext('2d');

        graphics.clearCanvas = function (canvas) {
            --canvas.height;
            ++canvas.height;
        };
        graphics.drawBatches = function (context) {
            _.each(graphics.batchObjects, function (value, key) {
                if (value.length) {
                    value[0].startBatchDraw(context);
                    _.invoke(value, 'draw', context);
                    value[0].endBatchDraw(context);
                }
            });
        };
        graphics.drawBatchless = function (context) {
            _.each(graphics.batchlessObjects, function (value) {
                value.startBatchDraw(context);
                value.draw(context);
                value.endBatchDraw(context);
            });
        };
        graphics.start = function () {
            graphics.running = true;
            cancelAnimationFrame(graphics.renderLoopId);
            graphics.renderLoopId = requestAnimationFrame(graphics.renderLoop);
        };
        graphics.stop = function () {
            graphics.running = false;

            cancelAnimationFrame(graphics.renderLoopId);
        };
        graphics.renderLoop = function (timeStamp) {
            graphics.renderLoopId = requestAnimationFrame(graphics.renderLoop);
            stats.begin();
            graphics.clearCanvas(graphics.screenCanvas);
            graphics.drawBatches(graphics.screenContext);
            graphics.drawBatchless(graphics.screenContext);
            stats.end();
        };
        graphics.renderOnce = function () {
            graphics.clearCanvas(graphics.screenCanvas);
            graphics.drawBatches(graphics.screenContext);
            graphics.drawBatchless(graphics.screenContext);


            //graphics.screenContext.fill();
            //graphics.screenContext.stroke();
        }
        graphics.addToBatch = function (batchName, object) {
            var batch = graphics.batchObjects[batchName];
            if (batch) {
                if (batch.indexOf(object) === -1)
                    graphics.batchObjects[batchName].push(object);
            } else {
                graphics.batchObjects[batchName] = [object];
            }
        };
        graphics.removeFromBatch = function (batchName, object) {
            var batch = graphics.batchObjects[batchName];
            if (batch) {
                var index = batch.indexOf(object);
                if (index !== -1) {
                    batch.splice(index, 1);
                }
            }
        };
        graphics.addBatchless = function (object) {
            graphics.batchlessObjects.push(object);
        };
        graphics.removeBatchless = function (object) {
            var index = graphics.batchlessObjects.indexOf(object);
            if (index !== -1) {
                graphics.batchlessObjects.splice(index, 1);
            }
        }
        document.getElementById('canvas-container').appendChild(graphics.screenCanvas);
        return graphics;
    };

    global.Game = global.Game || {};
    global.Game.Graphics = Graphics;
}(this));