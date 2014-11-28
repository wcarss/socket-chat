var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

var sockets = {};
var sockets_by_name = {};

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

function generate_name() {
  return "guest" + Math.floor(Math.random() * 200);
}

io.on('connection', function(socket) {
  var user = {
    name: generate_name(),
    other_data: 'Garbage',
    id: socket.id
  };

  console.log("emitting 'identify' for socket " + socket.id);
  socket.emit('identify', user);
  console.log("broadcasting 'connect' for socket " + socket.id);
  sockets_by_name[user['name']] = socket.id;
  sockets[socket.id] = user;
  console.log("Sockets I know of after connect:");
  console.log(sockets);
  console.log("Names I know of after connect:");
  console.log(sockets_by_name);

  socket.on('disconnect', function() {
    console.log('"disconnect" received from client ' + socket.id + '; emitting "disconnect".');
    io.emit("disconnect", "User " + sockets[socket.id]['name'] + " disconnected.");
    delete sockets_by_name[sockets[socket.id]['name']];
    delete sockets[socket.id];
    console.log("Sockets I know of after disconnect:");
    console.log(sockets);
    console.log("Names I know of after disconnect:");
    console.log(sockets_by_name);
  });

  socket.on('chat message', function(msg) {
    console.log('chat message "' + msg + '" received from socket ' + socket.id + '; emitting chat message.');
    var name_command = "/name ";
    if (msg.slice(0, name_command.length) == name_command && msg.length > name_command.length) {
      var new_name = msg.slice(name_command.length, msg.length);
      var old_name = sockets[socket.id]['name'];
      delete sockets_by_name[old_name];
      sockets_by_name[new_name] = socket.id;
      sockets[socket.id]['name'] = new_name;
      io.emit('name change', {'old_name': old_name, 'new_name': new_name});
    } else {
      io.emit(
        'chat message', {
          message: msg,
          user: sockets[socket.id]
        }
      );
    }
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
