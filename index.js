var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

var users = {};
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
  console.log("broadcasting 'new user' for socket " + socket.id);
  socket.broadcast.emit('new user', user);
  sockets_by_name[user['name']] = socket.id;
  users[socket.id] = user;
  console.log("Users I know of after connect:");
  console.log(users);
  console.log("Names I know of after connect:");
  console.log(sockets_by_name);

  socket.on('disconnect', function() {
    console.log('"disconnect" received from client ' + socket.id + '; emitting "disconnect".');
    io.emit("disconnect", users[socket.id]);
    delete sockets_by_name[users[socket.id]['name']];
    delete users[socket.id];
    console.log("Users I know of after disconnect:");
    console.log(users);
    console.log("Names I know of after disconnect:");
    console.log(sockets_by_name);
  });

  socket.on('chat message', function(msg) {
    console.log('chat message "' + msg + '" received from socket ' + socket.id + '; emitting chat message.');
    var name_command = "/name ";
    var names_command = "/names";
    if (msg.slice(0, name_command.length) == name_command && msg.length > name_command.length) {
      var new_name = msg.slice(name_command.length, msg.length);
      var old_name = users[socket.id]['name'];
      delete sockets_by_name[old_name];
      sockets_by_name[new_name] = socket.id;
      users[socket.id]['name'] = new_name;
      socket.emit('identify', users[socket.id]);
      io.emit(
        'name change', {
          'old_name': old_name,
          'new_name': new_name
        }
      );
    } else if (msg == names_command) {
      socket.emit('name list', sockets_by_name);
    } else {
      socket.broadcast.emit(
        'chat message', {
          message: msg,
          user: users[socket.id]
        }
      );
    }
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
