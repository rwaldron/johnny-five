five = require("johnny-five");
Edison = require("edison-io");
app = require('express')();
server = require('http').Server(app);
io = require('socket.io')(server);

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/TweakTheArduinoLogo.html');
});

board = new five.Board({io: new Edison()});
board.on("ready", function(){
  io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' })
    sensor = five.Sensor('A0')
    sensor.on('change',function(){
      socket.emit('color', {value: five.Fn.scale(this.value, 0, 1024, 0, 360)})
    })
  })
})

