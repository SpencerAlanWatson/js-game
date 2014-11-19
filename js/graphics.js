;
(function (global) {
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
        graphics.getContext = function (canvas) {
            var gl = null,
                options = {
                    'alpha': false
                };
            try {
                // Try to grab the standard context. If it fails, fallback to experimental.
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            } catch (e) {
                alert("Unable to initialize WebGL. Your browser may not support it.");
                gl = null;
            }
            return gl;
        }
        graphics.createContext = function (width, height) {
            var canvas = graphics.createCanvas(width, height);
            return canvas.getContext('2d', {
                'alpha': false
            });
        };

        graphics.initialize = function () {
            graphics.screenCanvas = graphics.createCanvas(graphics.width, graphics.height);
            graphics.screenContext = graphics.getContext(graphics.screenCanvas);

            // Only continue if WebGL is available and working

            if (graphics.screenContext) {
                // Set clear color to black, fully opaque
                graphics.screenContext.clearColor(0.0, 0.0, 0.0, 1.0);
                // Enable depth testing
                graphics.screenContext.enable(gl.DEPTH_TEST);
                // Near things obscure far things
                graphics.screenContext.depthFunc(gl.LEQUAL);
                // Clear the color as well as the depth buffer.
                graphics.screenContext.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            }
            document.getElementById('canvas-container').appendChild(graphics.screenCanvas);

            //This is to allow chaining,
            //that we can create a graphics object and init it in one line.
            return graphics;
        };



        graphics.clearCanvas = function (canvas) {
            --canvas.height;
            ++canvas.height;
        };
        graphics.drawBatches = function (context) {
            _.each(graphics.batchObjects, function (value, key) {
                if (value.length) {
                    var cache = value[0].startBatchDraw(context, graphics);
                    _.invoke(value, 'draw', context, cache);
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
        return graphics;
    };

    global.Game = global.Game || {};
    global.Game.Graphics = Graphics;
}(this));