var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.broadcast.emit("connect");
  socket.on('disconnect', function() {
    io.emit("disconnect", "User disconnected.");
  });
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
  socket.on('new user', function(msg) {
    io.emit('new user', 'User connected');
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
