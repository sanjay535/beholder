const express = require('express');
const http = require('http'); //provide by node
const socketio = require('socket.io');
const PORT = process.env.PORT || 4444;
const app = express();

const server = http.createServer(app);
const io = socketio(server); //it enable socket for server as well as for client
// app.use(function(req, res, next) {
//   // console.log('Middleware says %s %s', req);
//   next();
// })

app.use('/', express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:true}))
app.use(express.json());

// app.post('/user-details', (req, res)=>{
//   console.log(req.body);
//   res.redirect('/');
// })

let users = [];

io.on('connection', (socket) => {
  console.log('connection= ', socket.id);
  socket.on('user-details', data=>{
    users.push(data)
    console.log('user-details=',data)
  })

  socket.on('on-refresh',data=>{
    console.log('on refresh data = ',data);
    for(let i=0;i<users.length;i++){
      if(data.username===users[i].username){
        users[i].socketId=data.socketId;
      }
    }
    console.log('after refresh=',users);
  })

  socket.on('admin-cred', data=>{
    console.log('admin data=',data);
    if(data.adminPassword==="Harkishan535@" && data.adminUsername==="sanjay535"){
      io.to(data.socketId).emit('admin-verify', {isAdminLog:true})
    }else{
      io.to(data.socketId).emit('admin-verify', {isAdminLog:false})
    }
  })
  socket.on('disconnect', () => {
    console.log('user disconnected ',socket.id);
    // users = users.filter((user) => user.socketId !== socket.id);
    console.log('users= ', users);
  });
  console.log('users=',users)
});

server.listen(PORT, () => {
  // users.push({ username: 'Kajal', score: 3, socketId: 'KaYn58u0NKc8x5DwAAAP' })
  console.log(`server started on http://localhost:${PORT}`);
});