;
(function (global, undefined) {
    'use strict';

    function InputValue(value, pressed, released) {
        return {
            pressed: pressed ? true : false,
            released: released ? true : false,
            value: value !== undefined ? value : 0
        };
    }

    function InputValues() {
        return {
            'moveV': InputValue(),
            'moveH': InputValue(),
            'lookV': InputValue(),
            'lookH': InputValue(),
            'fire': InputValue(),
            'showStats': InputValue(),
            'showControls': InputValue()
        };
    }

    function defaultKeyboardBindings() {
        return {
            id: 'keyboard&mouse',
            index: -1,
            //w
            87: '+moveV',
            //up-arrow
            38: '+moveV',

            //s
            83: '-moveV',
            //down-arrow
            40: '-moveV',

            //a
            65: '-moveH',
            //left-arrow
            37: '-moveH',

            //d
            68: '+moveH',
            //right-arrow
            39: '+moveH',

            'mouse0': 'fire',
            //i
            73: 'showStats',
            //c
            67: 'showControls'
        };
    }

    function defaultKeyboardBindingsNew() {
        return {
            id: 'keyboard&mouse',
            index: -1,
            //w
            '-moveV': [87, 38],

            //s
            '+moveV': [83, 40],


            //a
            '-moveH': [65, 37],


            //d
            '+moveH': [68, 39],

            'fire': ['mouse0'],
            //i
            'showStats': [73],
            //c
            'showControls': [67]
        };
    }

    function defaultControllerBindings(controllerId, index) {
        return {
            id: controllerId,
            index: index,
            //left stick x
            'a0': 'moveH',

            //left stick y
            'a1': 'moveV',

            //right stick x
            'a2': 'lookH',
            //right stick y
            'a3': 'lookV',

            //A button
            0: 'fire',
            //right trigger
            6: 'fire'
        };
    }

    function defaultControllerBindingsNew(controllerId, index) {
        return {
            id: controllerId,
            index: index,
            //left stick x
            'moveH': ['a0'],

            //left stick y
            'moveV': ['a1'],

            //right stick x
            'lookH': ['a2'],
            //right stick y
            'lookV': ['a3'],

            //A button, right trigger
            'fire': [0, 6],
        };
    }

    function Controls(canvas, canvasContainer) {

        var controls = {
                controllerInputValues: {
                    '-1': InputValues(),
                    //'0': InputValues()
                },
                controllerBindings: {
                    '-1': defaultKeyboardBindingsNew(),
                    //'0': defaultControllerBindings("Xbox 360 Controller (STANDARD GAMEPAD Vendor: 028e Product: 045e)", 0)
                },
                controllerToPlayer: {
                    //-1 = keyboard&mouse
                    "-1": [true, false],
                    // "0": [false, false, true]

                },

                keysPressed: new Set(),
                keysReleased: new Set(),
                gamepadsConnected: [],
                gamepadsId: [],
                lastTimestamp: global.performance.now(),
                interval: 0,
            },

            domMousePositionX = 0,
            domMousePositionY = 0,
            canvasBoundingRect = canvas.getBoundingClientRect(),
            stats = new Stats();
        controls.gamepadsConnected.push(-1);
        controls.gamepadsId[-1] = 'Keyboard and Mouse';



        stats.setMode(0); // 0: fps, 1: ms

        document.getElementById('stats-container').appendChild(stats.domElement);

        EventDispatcher.prototype.apply(controls);
        controls.InputValue = InputValue;

        /**
         * Set's the value of an input for a controller
         * @param {String}  controllerId The id of the controller
         * @param {String}  inputName    The inputs name (NOTE: Not a button code!)
         * @param {Boolean} pressed      Was the input pressed?
         * @param {Boolean} released     Was the input released?
         * @param {Number}  value        The float value of the input with a range of [-1, 1]
         */
        controls.setInput = function (controllerId, inputName, settings) {
            var inputValue = controls.controllerInputValues[controllerId][inputName];
            inputValue.value = settings.value !== undefined ? settings.value : inputValue.value;
            inputValue.pressed = settings.pressed !== undefined ? settings.pressed : inputValue.pressed;
            inputValue.released = settings.released !== undefined ? settings.released : inputValue.released;
        }
        controls.getInput = function (controllerId, inputName) {
            return controls.controllerInputValues[controllerId][inputName];
        }
        controls.getMousePosition = function () {
            return controls.domToCanvasCoords(domMousePositionX, domMousePositionY);
        };
        controls.domToCanvasCoords = function (clientX, clientY) {
            return {
                x: clientX - canvasBoundingRect.left,
                y: clientY - canvasBoundingRect.top
            };
        };

        controls.start = function () {
            clearTimeout(controls.tickId);
            controls.tickId = setTimeout(controls.controlTick, controls.interval);
        };
        controls.stop = function () {
            clearTimeout(controls.tickId);
        };
        controls.addPlayerToController = function (playerId, controllerIndex) {
            var cTP = controls.controllerToPlayer[controllerIndex];
            if (!cTP) controls.controllerToPlayer[controllerIndex] = ([][playerId] = true);
            else
                cTP[playerId] = true;
        };
        controls.removePlayerFromController = function (playerId, controllerIndex) {
            var cTP = controls.controllerToPlayer[controllerIndex];
            if (cTP) {
                var index = playerId;
                delete cTP[index];
                let removed = cTP.splice(index, 1);
                delete removed[0];
            }
        };
        controls.addController = function (controller, isCustom) {
                controls.gamepadsConnected.push(controller.index);
                controls.gamepadsId[controller.index] = controller.id;

                controls.controllerInputValues[controller.index] = InputValues();
                controls.controllerToPlayer[controller.index] = [];
            if (!isCustom) {
                controls.controllerBindings[controller.index] = defaultControllerBindingsNew();
            }
        };
        controls.removeController = function (controller) {
            var indexOfIndex = controls.gamepadsConnected.indexOf(controller.index);
            delete controls.gamepadsId[controller.index];

            if (indexOfIndex !== -1) {
                delete controls.gamepadsConnected[indexOfIndex];
                controls.gamepadsConnected.splice(indexOfIndex, 1);

            }
            delete controls.controllerBindings[controller.index];
            delete controls.controllerInputValues[controller.index];
            delete controls.controllerToPlayer[controller.index];
        };
        controls.controlTick = function (timestamp) {
            stats.begin();
            timestamp = timestamp || global.performance.now();
            canvasBoundingRect = canvas.getBoundingClientRect();
            var gamepads = navigator.getGamepads(),
                mouseCoords = controls.getMousePosition(),
                tickDelta = timestamp - controls.lastTimestamp;

            _.each(controls.controllerToPlayer, function (playerIds, controllerIndex) {
                var bindings = controls.controllerBindings[controllerIndex],
                    inputValues = controls.controllerInputValues[controllerIndex];

                if (controllerIndex == -1) {
                    controls.keyboardTick(playerIds, controllerIndex, bindings, inputValues);
                } else if (!isNaN(controllerIndex)) {
                    controls.gamepadTick(gamepads[controllerIndex], playerIds, controllerIndex, bindings, inputValues);
                } else {
                    controls.customTick(playerIds, controllerIndex, bindings, inputValues);
                }
                playerIds.forEach(function (isOne, playerId) {
                    if (isOne) {
                        controls.dispatchEvent({
                            type: 'control-tick-p' + playerId,
                            controls: controls,
                            timestamp: timestamp,
                            lastTimestamp: controls.lastTimestamp,
                            tickDelta: tickDelta,
                            controllerIndex: controllerIndex,

                            input: inputValues,
                            mouseCoords: mouseCoords
                        });
                    }
                });
                controls.dispatchEvent({
                    type: 'control-tick-c' + controllerIndex,
                    controls: controls,
                    timestamp: timestamp,
                    lastTimestamp: controls.lastTimestamp,
                    tickDelta: tickDelta,
                    //controllerId: bindings.id,
                    controllerIndex: controllerIndex,
                    players: playerIds,

                    input: inputValues,
                    mouseCoords: mouseCoords
                });
            });


            controls.lastTimestamp = timestamp;
            stats.end();
            controls.tickId = setTimeout(controls.controlTick, controls.interval);

        };
        controls.keyboardTick = function (playerIds, controllerIndex, bindings, inputValues) {
            _.each(bindings, function (keyCodes, inputName) {
                if (inputName === 'id' || inputName === 'index')
                    return;

                var inputProperName,
                    pressed = _.any(keyCodes, function (keyCode) {
                        return controls.keysPressed.has(keyCode)
                    }),
                    released = _.any(keyCodes, function (keyCode) {
                        return controls.keysReleased.has(keyCode)
                    });

                if (inputName[0] === '+' || inputName[0] === '-') {
                    inputProperName = inputName.substr(1);
                } else {
                    inputProperName = inputName;
                }
                inputValues[inputProperName].pressed = pressed;
                inputValues[inputProperName].released = released;

                if (pressed) {
                    if (inputName[0] === '-') {
                        inputValues[inputProperName].value = -1;
                    } else {
                        inputValues[inputProperName].value = 1;

                    }

                } else if (released) {
                    inputValues[inputProperName].value = 0.0;
                }

            });
            controls.keysReleased.clear();
        };
        controls.gamepadTick = function (gamepad, playerIds, controllerIndex, bindings, inputValues) {
            if (!gamepad)
                return console.warn('Gamepad with the index ' + controllerIndex + ' is not connected anymore!');
            _.each(bindings, function (buttonCodes, inputName) {
                if (inputName === 'id' || inputName === 'index')
                    return;
                let value = _.max(buttonCodes, function (buttonCode) {
                        if (("" + buttonCode)[0] === 'a') {
                            return gamepad.axes[buttonCode.substr(1)];
                        } else {
                            return gamepad.buttons[buttonCode].value;
                        }
                    }),
                    pressed = _.any(buttonCodes, function (buttonCode) {
                        if (("" + buttonCode)[0] === 'a') {
                            return gamepad.axes[buttonCode.substr(1)] !== 0;
                        } else {
                            return gamepad.buttons[buttonCode].pressed;
                        }
                    }),
                    released = _.any(buttonCodes, function (buttonCode) {
                        if (("" + buttonCode)[0] === 'a') {
                            if (inputValues[inputName].pressed && gamepad.axes[buttonCode.substr(1)] === 0)
                                return true;
                        } else {
                            if (inputValues[inputName].pressed && !gamepad.buttons[buttonCode])
                                return true;
                        }
                        return false;
                    });
                inputValues[inputName].pressed = pressed;
                inputValues[inputName].released = released;
                inputValues[inputName].value = ("" + value)[0] === 'a' ? gamepad.axes[value.substr(1)] : gamepad.buttons[value].value;

            });
        };
        controls.customTick = function (playerIds, controllerIndex, bindings, inputValues) {

        };
        controls.keyDown = function (event) {

            controls.keysPressed.add(event.keyCode);
            event.preventDefault();
            return false;
        };
        controls.keyUp = function (event) {

            controls.keysPressed.delete(event.keyCode);
            controls.keysReleased.add(event.keyCode);
            event.preventDefault();
            return false;
        };
        controls.mouseMove = function (event) {
            domMousePositionX = event.clientX;
            domMousePositionY = event.clientY;
        };
        controls.mouseDown = function (event) {
            var buttonName = "mouse" + event.button;

            controls.keysPressed.add(buttonName);

            event.preventDefault();
            return false;

        };

        controls.mouseUp = function (event) {
            var buttonName = "mouse" + event.button;

            controls.keysPressed.delete(buttonName);
            controls.keysReleased.add(buttonName);

            event.preventDefault();
            return false
        };
        controls.gamepadConnected = function (event) {
            console.log('gamepad connected', event);

            var gamepad = event.gamepad;
            controls.addController(gamepad);
            controls.dispatchEvent({
                type: 'control-connected',
                controls: controls,
                gamepad: gamepad
            });
        };
        controls.gamepadDisconnected = function (event) {
            console.log('gamepad disconnected', event);
            var gamepad = event.gamepad;
            controls.removeController(gamepad);
            controls.dispatchEvent({
                type: 'control-disconnected',
                controls: controls,
                gamepad: gamepad
            });
        };
        controls.bind = function () {
            document.addEventListener('keydown', controls.keyDown);
            document.addEventListener('keyup', controls.keyUp);

            canvasContainer.addEventListener('mousemove', controls.mouseMove);
            canvasContainer.addEventListener('mousedown', controls.mouseDown);
            canvasContainer.addEventListener('mouseup', controls.mouseUp);

            global.addEventListener('gamepadconnected', controls.gamepadConnected);
            global.addEventListener('gamepaddisconnected', controls.gamepadDisconnected);
            var gamepads = navigator.getGamepads(),
                gamepad = gamepads[0],
                index = 0;
            while (gamepad) {
                controls.addController(gamepad);
                gamepad = gamepads[++index];
            }
        };
        controls.unbind = function () {

            document.removeEventListener('keydown', controls.keyDown);
            document.removeEventListener('keyup', controls.keyUp);

            canvas.removeEventListener('mousemove', controls.mouseMove);
            canvas.removeEventListener('mousedown', controls.mouseDown);
            canvas.removeEventListener('mouseup', controls.mouseUp);

            global.removeEventListener('gamepadconnected', controls.gamepadConnected);
            global.removeEventListener('gamepaddisconnected', controls.gamepadDisconnected);

        };
        controls.bind();
        return controls;
    };
    global.Game = global.Game || {};
    global.Game.Controls = Controls;
}(this));

function controllerTest() {
    'use strict';
    var gamepads = navigator.getGamepads();

    function intervalFunc() {
        console.group('Controller Buttons Pressed');
        var gamepad = gamepads[0],
            index = 0;
        while (gamepad) {
            console.group(gamepad.index);
            gamepad.buttons.forEach(function (button, buttonIndex) {
                if (button.pressed) {
                    console.info('Button $d is pressed with value $d', buttonIndex, button.value);
                }
            });
            console.groupEnd();
            gamepad = gamepads[++index];
        }
        console.groupEnd();
    }
    window.intervalId = setInterval(intervalFunc, 100);
}