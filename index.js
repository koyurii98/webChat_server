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
  
  //새로운 유저 알림
  socket.on('newUser', function (name) {
    console.log(name+'님이 접속하였습니다.')
    //소켓에 이름저장
    socket.name = name;
    //모든 소켓에 전송
    io.sockets.emit('update', { type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

  //전송한 메세지 받기
  socket.on('message', function (data) {
    //보낸사람 이름 추가
    data.name = socket.name ;
    console.log(data);

    //보낸사람을 제외하고 메세지 전송
    socket.broadcast.emit('update', data);
  })

  //종료
  socket.on('disconnect', function() {
    console.log(socket.name+'님이 나가셨습니다.');
    socket.broadcast.emit('update', { type: 'discounnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
  })
})

server.listen(8000, function () {
  console.log("서버 실행 중...");
})