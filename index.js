var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

console.logCopy = console.log.bind(console);

console.log = function() {
    if (arguments.length) {
      var timestamp = '[' + moment().format("YYYY-MM-DD HH:mm:ss.sss") + '] ';
      this.logCopy(timestamp, arguments);
    }
  };

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.broadcast.emit("connect");
  console.log("broadcasting 'connect' for socket "+socket.id);
  socket.on('disconnect', function() {
    console.log('"disconnect" received from client '+ socket.id +'; emitting "disconnect".');
    io.emit("disconnect", "User disconnected.");
  });
  socket.on('chat message', function(msg) {
    console.log('chat message "' + msg + '" received from socket '+socket.id+'; emitting chat message.');
    io.emit('chat message', msg);
  });
  socket.on('new user', function() {
    console.log('"new user" received from socket '+socket.id+'; emitting "new user".');
    io.emit('new user', 'User connected');
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
