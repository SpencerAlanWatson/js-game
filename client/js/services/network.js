;
define(['vendor/lodash', 'vendor/socket.io', 'mod/manager'], function (_, io, manager, undefined) {
    'use strict';

    function NetworkControls(socket, id, index, player) {
        var nc = {
            id: id,
            index: index,
            player: player
        };

        nc.physicsTick = function (event) {
            socket.emit('get input', index, function (inputs) {
                manager.controls.setAllInput(index, inputs);
            });
        };
        nc.setupListeners = function (eventEmitters) {
            var controls = eventEmitters.controls;
            controls.addController(nc, true);
            controls.addPlayerToController(nc.player, index);

            eventEmitters.physics.addEventListener('physicsTick', nc.physicsTick);

        };
        nc.removeListeners = function (eventEmitters) {


            eventEmitters.physics.removeEventListener('physicsTick', nc.physicsTick);
            var controls = eventEmitters.controls;
            controls.removeController(nc, true);
            //controls.removePlayerFromController(ai.player.playerNumber, ai.controllerIndex);
        };
        return nc;
    }

    function Network() {
        var socket = io.connect('http://localhost'),
            uid,
            controllers = [];

        socket.on('connect', function () {
            socket.emit('initialize', {}, function (data) {


                manager.controls.removePlayerFromController(0, '-1');
                manager.controls.addPlayerToController(data.playerNumber, '-1');
                _.each(data.players, function (player) {
                    var nc = NetworkControls(socket, "Network Controls", player.index, player.playerNumber);
                    nc.setupListeners(manager.eventEmitters);
                    controllers.push(nc);
                });
                manager.eventEmitters.physics.addEventListener('physicsTick', function () {
                    socket.emit('send input', {
                        index: data.index,
                        input: manager.controls.controllerInputValues['-1']
                    });
                });

            });
        });
        /* socket.on('news', function (data) {
            console.log(data);
            if (Game && manager && manager.controls) {
                socket.emit('my other event', manager.controls.controllerInputValues);
            }
        });*/
    };

    return Network;
});