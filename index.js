var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.broadcast.emit("connect");
  console.log("broadcasting 'connect'");
  socket.on('disconnect', function() {
    console.log('"disconnect" received; emitting "disconnect".');
    io.emit("disconnect", "User disconnected.");
  });
  socket.on('chat message', function(msg) {
    console.log('chat message "' + msg + '" received; emitting chat message.');
    io.emit('chat message', msg);
  });
  socket.on('new user', function() {
    console.log('"new user" received; emitting "new user".');
    io.emit('new user', 'User connected');
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
