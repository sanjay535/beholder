const express = require('express');
const http = require('http'); //provide by node
const socketio = require('socket.io');
const PORT = process.env.PORT || 4444;
const app = express();

const server = http.createServer(app);
const io = socketio(server); //it enable socket for server as well as for client

app.use('/', express.static(__dirname + '/public'));

let users = [];

io.on('connection', (socket) => {
  console.log('connection= ', socket.id);
  

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users = users.filter((user) => user.socketId !== socket.id);
    console.log('users= ', users);
  });
});

server.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});