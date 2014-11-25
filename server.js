/*global require*/
var express = require('express'),
    app = express(),
    fs = require('fs'),
    _ = require('lodash'),
    buildify = require('buildify');



app.get('/js', function (req, res) {
    fs.readFile('allscripts.json', {
        encoding: 'utf8'
    }, function (err, jsonString) {
        res.send(buildify().concat(JSON.parse(jsonString)).getContent());
    });
    res.type('application/javascript');
});

app.use(express.static('client'));
var server = app.listen(3000, function () {

    var info = server.address();
    console.log('Example app listening at http://%s:%s', info.address, info.port)

});

function multiplayer() {
    var io = require('socket.io')(server),
        players = [],
        totalPlayers = 2,
        inputValues = {};


    io.on('connection', function (socket) {
        socket.on('initialize', function (data, fn) {
            var results = {};
            if (players.length <= totalPlayers) {
                results.playerNumber = players.length;
                results.index = _.uniqueId('player_');
            }

            results.players = players;
            fn(results);
            var playerObj = {
                playerNumber: results.playerNumber,
                index: results.index
            };
            socket.emit('new player', playerObj);
            players.push(playerObj);
            inputValues[playerObj.index] = {};
        });
        socket.emit('news', {
            hello: 'world'
        });
        socket.on('send input', function (data) {
            inputValues[data.index] = data.input;
        });
        socket.on('get input', function (data, fn) {
            fn(inputValues[data]);
        });
    });
}
multiplayer();