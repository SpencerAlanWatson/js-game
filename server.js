/*global require*/
var express = require('express'),
    app = express(),
    fs = require('fs'),
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

var io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});