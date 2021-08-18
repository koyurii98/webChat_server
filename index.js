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

  socket.on('newUser', function () {
    socket.emit('update', { type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })


  socket.on('send_message', (message) =>{
    socket.to(message.receiverChatID).emit('receive_message', { 
      content: message.content,
      senderChatID: message.senderChatID, 
      receiverChatID: message.receiverChatID,
      time: message.time,
    })
  })

  //종료
  socket.on('disconnect', function() {
    socket.online = true;
    socket.emit('update', { type: 'disconnect', name: 'SERVER', message: name + '님이 나가셨습니다.'});
    socket.leave(chatID);
  })
})

server.listen(8000, function () {
  console.log("서버 실행 중...");
})