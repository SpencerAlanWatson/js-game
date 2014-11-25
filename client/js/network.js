;
(function (global, undefined) {
    'use strict';

    function Network() {
        var socket = io.connect('http://localhost'),
            uid;
        socket.on('connect', function(data) {
            console.log(data);
            socket.on('input', function(data) {
               console.log(data) 
            });
        });
       /* socket.on('news', function (data) {
            console.log(data);
            if (Game && Game.manager && Game.manager.controls) {
                socket.emit('my other event', Game.manager.controls.controllerInputValues);
            }
        });*/
    };

    global.Game = global.Game || {};
    global.Game.Network = Network;
}(this));