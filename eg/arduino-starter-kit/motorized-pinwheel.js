var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var gate = new five.Pin(9);
  var button = new five.Button(2);
  button.on("press", function() {
    gate.write(1);
  });
  button.on("release", function() {
    gate.write(0);
  });
});
