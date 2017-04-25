var five = require("johnny-five");
var Edison = require("edison-io");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(3000);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/arduino-logo.html");
});

var board = new five.Board({
  io: new Edison()
});
board.on("ready", function() {
  io.on("connection", function(socket) {
    socket.emit("news", {
      hello: "world"
    });
    var sensor = five.Sensor("A0");
    sensor.on("change", function() {
      socket.emit("color", {
        value: five.Fn.scale(this.value, 0, 1024, 0, 360)
      });
    });
  });
});
