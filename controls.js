;
(function (global) {
    'use strict';

    function Controls(canvas) {
        var controls = {
                keyToName: {
                    //w
                    87: 'up1',
                    //up-arrow
                    38: 'up2',

                    //s
                    83: 'down1',
                    //down-arrow
                    40: 'down2',

                    //a
                    65: 'left1',
                    //left-arrow
                    37: 'left2',

                    //d
                    68: 'right1',
                    //right-arrow
                    39: 'right2',

                    'mouse0': 'fire1'

                },
                keysDown: new Set(),
                mouseButtonsDown: new Set(),
                lastTimestamp: global.performance.now()
            },

            domMousePositionX = 0,
            domMousePositionY = 0,
            canvasBoundingRect = canvas.getBoundingClientRect(),
            stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        document.getElementById('stats-container').appendChild(stats.domElement);

        EventDispatcher.prototype.apply(controls);

        controls.dispatchPressEvent = function (keyName, originalEvent) {
            controls.dispatchEvent({
                type: keyName + 'Press',
                originalEvent: originalEvent,
                timestamp: global.performance.now()
            });
        };
        controls.dispatchReleaseEvent = function (keyName, originalEvent) {
            controls.dispatchEvent({
                type: keyName + 'Release',
                originalEvent: originalEvent,
                timestamp: global.performance.now()
            });
        };
        controls.dispatchHoldEvent = function (keyName, originalEvent) {
            controls.dispatchEvent({
                type: keyName + 'Hold',
                originalEvent: originalEvent,
                timestamp: global.performance.now()
            });
        };
        controls.getMousePosition = function () {
            return controls.domToCanvasCoords(domMousePositionX, domMousePositionY);
        };
        controls.domToCanvasCoords = function (clientX, clientY) {
            return {
                x: clientX - canvasBoundingRect.left,
                y: clientY - canvasBoundingRect.top
            };
        };
        controls.keyDown = function (event) {
            var keyName = controls.keyToName[event.keyCode];
            if (keyName && !controls.keysDown.has(keyName)) {
                controls.dispatchPressEvent(keyName, event);
                controls.keysDown.add(keyName);
            }
            event.preventDefault();
            return false;
        };
        controls.start = function () {
            cancelAnimationFrame(controls.tickId);
            controls.tickId = requestAnimationFrame(controls.controlTick);
        };
        controls.stop = function () {
            cancelAnimationFrame(controls.tickId);
        };
        controls.controlTick = function (timestamp) {
            stats.begin();
            var pads = navigator.getGamepads(),
                axes = pads[0] ? pads[0].axes : [0,0,0,0],
                buttons = pads[0] ? pads[0].buttons : [];
            buttons[6] = buttons[6] || {pressed: false, value: 0};
            
            controls.dispatchEvent({
                type: 'controltick',
                controls: controls,
                timestamp: timestamp,
                axes: axes,
                buttons: buttons,
                lastTimestamp: controls.lastTimestamp,
                tickDelta: timestamp - controls.lastTimestamp

            });
            controls.lastTimestamp = timestamp;
            for (var keyName of controls.keysDown) {
                controls.dispatchHoldEvent(keyName);
            }
            stats.end();
            controls.tickId = requestAnimationFrame(controls.controlTick);

        };
        controls.keyUp = function (event) {
            var keyName = controls.keyToName[event.keyCode];
            if (keyName) {
                controls.keysDown.delete(keyName);
                controls.dispatchReleaseEvent(keyName, event);
            }
            event.preventDefault();
            return false;
        };
        controls.mouseMove = function (event) {
            //console.log(event);
            domMousePositionX = event.clientX;
            domMousePositionY = event.clientY;
        };
        controls.mouseDown = function (event) {
            var buttonName = "mouse" + event.button,
                keyName = controls.keyToName[buttonName];
            if (keyName && !controls.mouseButtonsDown.has(keyName)) {
                controls.dispatchPressEvent(keyName, event);
                controls.mouseButtonsDown.add(keyName);
            }
            event.preventDefault();
            return false;

        };

        controls.mouseUp = function (event) {
            var buttonName = "mouse" + event.button,
                keyName = controls.keyToName[buttonName];

            controls.mouseButtonsDown.delete(keyName);
            if (keyName) {
                controls.dispatchReleaseEvent(keyName, event);
            }
            event.preventDefault();
            return false
        };
        controls.bind = function () {
            document.addEventListener('keydown', controls.keyDown);
            document.addEventListener('keyup', controls.keyUp);
            canvas.addEventListener('mousemove', controls.mouseMove);
            canvas.addEventListener('mousedown', controls.mouseDown);
            canvas.addEventListener('mouseup', controls.mouseUp);
        };
        controls.unbind = function () {
            document.removeEventListener('keydown', controls.keyDown);
            document.removeEventListener('keyup', controls.keyUp);
            canvas.removeEventListener('mousemove', controls.mouseMove);
            canvas.removeEventListener('mousedown', controls.mouseDown);
            canvas.removeEventListener('mouseup', controls.mouseUp);

        };
        controls.bind();
        return controls;
    };
    global.Game = global.Game || {};
    global.Game.Controls = Controls;
}(this));