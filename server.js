/**
 * Created by zhb on 16/7/27.
 */
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    func = require('./function');
app.use('/', express.static(__dirname + '/public'));
server.listen(3008);
//handle the socket
io.sockets.on('connection', func);
exports.io=io;