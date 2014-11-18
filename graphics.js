;
(function (global, undefined) {
    'use strict';

    function Graphics(width, height) {
        var graphics = {},
            stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        document.getElementById('stats-container').appendChild(stats.domElement);


        graphics.running = false;
        graphics.height = height;
        graphics.width = width;
        graphics.batchlessObjects = [];
        graphics.batchObjects = {};

        graphics.createCanvas = function (width, height) {
            var canvas = document.createElement('canvas');
            canvas.height = height;
            canvas.width = width;
            return canvas;
        };
        graphics.createContext = function (width, height) {
            var canvas = graphics.createCanvas(width, height);
            return canvas.getContext('2d', {
                'alpha': false
            });
        };

        graphics.screenCanvas = graphics.createCanvas(width, height);
        graphics.screenContext = graphics.screenCanvas.getContext('2d', {
            'alpha': false
        });

        graphics.clearCanvas = function (canvas) {
            --canvas.height;
            ++canvas.height;
        };
        graphics.drawBatches = function (context) {
            _.each(graphics.batchObjects, function (value, key) {
                if (value.length) {
                    var cache = value[0].startBatchDraw(context, graphics);
                    _.invoke(value, 'draw',context, cache);
                    value[0].endBatchDraw(context, graphics);
                }
            });
            //context.putImageData(graphics.nextFrame.getImageData(0, 0, graphics.width, graphics.height), 0,0); //.graphics.nextFrame.canvas, 0, 0);
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
                delete batch[index];
                if (index !== -1) {
                    let removed = batch.splice(index, 1);
                    delete removed[0];
                }
            }
        };
        graphics.addBatchless = function (object) {
            graphics.batchlessObjects.push(object);
        };
        graphics.removeBatchless = function (object) {
            var index = graphics.batchlessObjects.indexOf(object);
            delete graphics.batchlessObjects[index];
            if (index !== -1) {
                let removed = graphics.batchlessObjects.splice(index, 1);
                delete removed[0];
            }
        }
        window.addEventListener('resize', function (event) {
            var width = window.innerWidth,
                height = window.innerHeight;

            graphics.width = width;
            graphics.height = height;
            graphics.screenCanvas.width = width;
            graphics.screenCanvas.height = height;
        });
        document.getElementById('canvas-container').appendChild(graphics.screenCanvas);
        return graphics;
    };

    global.Game = global.Game || {};
    global.Game.Graphics = Graphics;
}(this));