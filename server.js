const express = require('express');
const http = require('http'); //provide by node
const socketio = require('socket.io');
const PORT = process.env.PORT || 4444;
const app = express();
const questions=require('./data.js');
const answers=require('./answer.js');

const server = http.createServer(app);
const io = socketio(server); //it enable socket for server as well as for client
// app.use(function(req, res, next) {
//   // console.log('Middleware says %s %s', req);
//   next();
// })

app.use('/', express.static(__dirname + '/public'));
// app.use(express.urlencoded({extended:true}))
// app.use(express.json());

// app.post('/user-details', (req, res)=>{
//   console.log(req.body);
//   res.redirect('/');
// })

let users = [];

io.on('connection', (socket) => {
  // console.log('connection= ', socket.id);

  socket.on('user-details', data=>{
    users.push(data)
    console.log('user-details=',data)
  })

  socket.on('on-refresh',data=>{
    console.log('on refresh data = ',data);
    let isUserExist=false;
    for(let i=0;i<users.length;i++){
      if(data.username===users[i].username){
        users[i].socketId=data.socketId;
        isUserExist=true;
        break;
      }
    }
    if(!isUserExist){
      users.push({username:data.username, score:0,socketId:data.socketId});
    }
    // console.log('after refresh=',users);
  })

  socket.on('get-question-list', data=>{
    io.to(data.socketId).emit('question-list', {...questions})
  })

  socket.on('broadcast-question',data=>{
    const questionList=questions.questions;
    const question=questionList.find(item=>item.id===data.id);
    socket.broadcast.emit('question', {question:question});
  })

  socket.on('remove-question', (data)=>{
    socket.broadcast.emit('remove-question', {...data});
  })

  socket.on('admin-cred', data=>{
    // console.log('admin data=',data);
    if((data.adminPassword==="Harkishan535@" && data.adminUsername==="sanjay535")||(data.adminPassword==="ena123" && data.adminUsername==="ena@123")){
      io.to(data.socketId).emit('admin-verify', {isAdminLog:true})
    }else{
      io.to(data.socketId).emit('admin-verify', {isAdminLog:false})
    }
  })

  socket.on('answer', data=>{
    // console.log(data);
    // console.log(answers)
    // console.log(answers.answers[data.quesNo-1])
    if(answers.answers[data.quesNo-1]===data.ansNo){
      for(let i=0;i<users.length;i++){
        if(users[i].username===data.username){
          users[i].score+=1;
          // console.log('correct answer');
          break;
        }
      }
      // console.log(users)
    }
  })

  socket.on('users-score', data=>{
    // console.log('user-score', data);
    io.to(data.socketId).emit('users-score', {users:users});
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