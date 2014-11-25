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

    function makeButtonAxisBinding(positiveButton, negativeButton) {
        return {
            'pos': positiveButton,
            'neg': negativeButton
        };
    }

    function defaultKeyboardBindingsNew() {
        return {
            id: 'Keyboard and Mouse',
            //w
            // '-moveV': [87, 38],
            'moveV': [makeButtonAxisBinding(83, 87), makeButtonAxisBinding(40, 38)],

            //s
            //'+moveV': [83, 40],


            //a
            //'-moveH': [65, 37],
            'moveH': [makeButtonAxisBinding(68, 65), makeButtonAxisBinding(39, 37)],



            //d
            //  '+moveH': [68, 39],

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
                inputNames: [
                    'moveV',
                    'moveH',
                    'lookV',
                    'lookH',
                    'fire',
                    'showStats',
                    'showControls'
                ],
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
                bindingDB: null
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

        controls.addBindingToController = function (controllerIndex, inputName, buttonName) {
            if (controls.controllerBindings[controllerIndex]) {
                controls.controllerBindings[controllerIndex][inputName].push(buttonName);
            }
        };
        controls.removeBindingFromController = function (controllerIndex, inputName, buttonName) {
            if (controls.controllerBindings[controllerIndex]) {
                if (buttonName) {
                    let buttonIndex = controls.controllerBindings[controllerIndex][inputName].indexOf(buttonName);
                    if (buttonIndex !== -1) {
                        delete controls.controllerBindings[controllerIndex][inputName][buttonIndex];
                        controls.controllerBindings[controllerIndex][inputName].splice(buttonIndex, 1);

                    }
                } else {
                    delete controls.controllerBindings[controllerIndex][inputName];
                    controls.controllerBindings[controllerIndex][inputName] = [];
                }
            }
        };
        controls.openDatabase = function (callback) {
            if (controls.bindingDB) {
                controls.bindingDB.close();
            }
            controls.bindingDB = window.indexedDB.open('Game Controls');
            // This event handles the event whereby a new version of the database needs to be created
            // Either one has not been created before, or a new version number has been submitted via the
            // window.indexedDB.open line above
            controls.bindingDB.addEventListener('upgradeneeded', function (event) {
                var db = event.target.result;

                db.onerror = function (event) {
                    //note.innerHTML += '<li>Error loading database.</li>';
                    throw event;
                };

                // Create an objectStore for this database

                var objectStore = db.createObjectStore("bindings", {
                    keyPath: "id"
                });

                // define what data items the objectStore will contain
                _.each(controls.inputNames, function (inputName) {
                    objectStore.createIndex(inputName, inputName, {
                        unique: false
                    });
                });

            });
            controls.bindingDB.addEventListener('success', function (event) {
                controls.bindingDB = controls.bindingDB.result;
                callback(controls.bindingDB);
            });
        };
        controls.saveControllerBindings = function (controllerIndex, callback) {
            if (controls.controllerBindings[controllerIndex]) {
                controls.openDatabase(function (db) {
                    var transaction = db.transaction(["bindings"], "readwrite");
                    transaction.addEventListener('error', function (event) {
                        throw event;
                    });
                    var objectStore = transaction.objectStore("bindings");
                    // add our newItem object to the object store
                    var objectStoreRequest = objectStore.add(controls.controllerBindings[controllerIndex]);
                    objectStoreRequest.addEventListener('success', function (event) {
                        callback(event);
                    });

                    objectStoreRequest.addEventListener('error', function (event) {
                        throw event;
                    });
                });

            }
        };
        controls.loadControllerBindings = function (controllerIndex, controllerId, callback) {
            controls.openDatabase(function (db) {
                var transaction = db.transaction(["bindings"], "readwrite");
                transaction.addEventListener('error', function (event) {
                    throw event;
                });
                var objectStore = transaction.objectStore("bindings");
                // add our newItem object to the object store
                var objectStoreRequest = objectStore.get(controllerId);
                objectStoreRequest.addEventListener('success', function (event) {
                    var myRecord = objectStoreRequest.result;
                    controls.controllerBindings[controllerIndex] = myRecord;
                    callback(myRecord);
                });
                objectStoreRequest.addEventListener('error', function (event) {
                    throw event;
                });
            });
        };


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
        controls.setAllInput = function (controllerId, inputs) {
            controls.controllerInputValues[controllerId] = inputs;
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
            for (let i = 0, noPlayer = true; i < Game.manager.playerCount; ++i) {
                let noController = _.all(controls.controllerToPlayer, function (players, controllerIndex) {
                    return !players[i];
                });
                if (noController && noPlayer) {
                    controls.controllerToPlayer[controller.index][i] = true;
                    noPlayer = false;
                } else {
                    controls.controllerToPlayer[controller.index][i] = false;

                }
            }
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

            controls.dispatchEvent({
                type: 'control-tick-all',
                controls: controls,
                timestamp: timestamp,
                lastTimestamp: controls.lastTimestamp,
                tickDelta: tickDelta,
                keysPressed: controls.keysPressed,
                keysReleased: controls.keysReleased,
                gamepads: gamepads,
                //controllerId: bindings.id,
                mouseCoords: mouseCoords
            });
            controls.keysReleased.clear();



            controls.lastTimestamp = timestamp;
            stats.end();
            controls.tickId = setTimeout(controls.controlTick, controls.interval);

        };
        controls.isAxisName = function (buttonCode) {
            return typeof buttonCode === 'string' && buttonCode[0] === 'a';
        };
        controls.getValue = function getValue(gamepad, buttonCode) {
            if (typeof buttonCode === 'object') {
                return getValue(gamepad, buttonCode.pos) - getValue(gamepad, buttonCode.neg);
            } else if (controls.isAxisName(buttonCode)) {
                return gamepad.axes[buttonCode.substr(1)];
            }
            return gamepad.buttons[buttonCode].value;
        };
        controls.keyboardTick = function (playerIds, controllerIndex, bindings, inputValues) {
            _.each(bindings, function (keyObjects, inputName) {
                if (inputName === 'id' || inputName === 'index')
                    return;

                var value = Game.Math.Clamp(_.reduce(keyObjects, function getValue(sum, keyCode) {
                        if (typeof keyCode === 'object') {
                            return sum + getValue(0, keyCode.pos) - getValue(0, keyCode.neg);
                        }
                        return sum + (controls.keysPressed.has(keyCode) ? 1 : 0);
                    }, 0), -1, 1),

                    pressed = _.any(keyObjects, function isPressed(keyCode) {
                        if (typeof keyCode === 'object') {
                            return isPressed(keyCode.pos) || isPressed(keyCode.neg);
                        }
                        return controls.keysPressed.has(keyCode)
                    }),
                    released = _.any(keyObjects, function isReleased(keyCode) {
                        if (typeof keyCode === 'object') {
                            return isReleased(keyCode.pos) || isReleased(keyCode.neg);
                        }
                        return controls.keysReleased.has(keyCode)
                    });
                inputValues[inputName].value = value;
                inputValues[inputName].pressed = pressed;
                inputValues[inputName].released = released;

            });
            //controls.keysReleased.clear();
        };
        controls.gamepadTick = function (gamepad, playerIds, controllerIndex, bindings, inputValues) {
            if (!gamepad)
                return console.warn('Gamepad with the index ' + controllerIndex + ' is not connected anymore!');
            _.each(bindings, function (buttonCodes, inputName) {
                if (inputName === 'id' || inputName === 'index')
                    return;
                let value = Game.Math.Clamp(_.reduce(buttonCodes, function (sum, buttonCode) {
                        return sum + controls.getValue(gamepad, buttonCode);
                    }, 0), -1, 1),
                    pressed = _.any(buttonCode, function isPressed(buttonCode) {

                        if (typeof buttonCode === 'object') {
                            return isPressed(buttonCode.pos) || isPressed(buttonCode.neg);
                        } else if (controls.isAxisName(buttonCode)) {
                            return gamepad.axes[buttonCode.substr(1)] !== 0;
                        } else {
                            return gamepad.buttons[buttonCode].pressed;
                        }
                    }),
                    released = _.any(buttonCodes, function isReleased(buttonCode) {
                        if (typeof buttonCode === 'object') {
                            return isReleased(buttonCode.pos) || isReleased(buttonCode.neg);
                        } else if (controls.isAxisName(buttonCode)) {
                            if (inputValues[inputName].pressed && gamepad.axes[buttonCode.substr(1)] === 0)
                                return true;
                        } else {
                            if (inputValues[inputName].pressed && !gamepad.buttons[buttonCode].pressed)
                                return true;
                        }
                        return false;
                    });
                inputValues[inputName].pressed = pressed;
                inputValues[inputName].released = released;
                inputValues[inputName].value = value;

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