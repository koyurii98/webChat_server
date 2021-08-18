const express = require('express');
const socket = require('socket.io');
const http = require('http');
const router = require('./router');
const app = express();

const server = http.createServer(app);

const io = socket(server,{
  cors:{
    origin:"*"
  }
});
app.use(router);
io.sockets.on('connection', function (socket) {
  const { chatID, name } = socket.handshake.query;
  
  socket.join(chatID);
  socket.name = name;
  socket.user_id= chatID;
  console.log(io.engine.clientsCount); 
  //새로운 유저 알림
  socket.on('newUser', function () {
    console.log(name+'님이 접속하였습니다.')
    //모든 소켓에 전송
    socket.emit('update', { type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })


  socket.on('send_message', (message) =>{
    console.log(message);
    //해당유저한테 채팅보냄
    socket.to(message.receiverChatID).emit('receive_message', { message})
  })

  //종료
  socket.on('disconnect', function() {
    socket.online = true;
    console.log(socket.name+'님이 나가셨습니다.');
    socket.leave(chatID);
    socket.broadcast.emit('update', { type: 'discounnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
  })
})

server.listen(8000, function () {
  console.log("서버 실행 중...");
})