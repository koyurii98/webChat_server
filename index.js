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
  const { chatID } = socket.handshake.query;
  
  socket.join(chatID);

  socket.on('newUser', function (name) {
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

  // //종료
  // socket.on('disconnect', function(name) {
  //   socket.online = true;
  //   socket.broadcast.emit('update', { type: 'disconnect', name: 'SERVER', message: name + '님이 나가셨습니다.'});
  // })

  socket.on('exitRoom', function(name) {
    socket.leave(chatID);
    socket.broadcast.emit('update', { type: 'disconnect', name: 'SERVER', message: name + '님이 나가셨습니다.'});
  })
})

server.listen(8000, function () {
  console.log("서버 실행 중...");
})