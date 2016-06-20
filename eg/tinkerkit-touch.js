var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var touch = new five.Button({
    controller: "TINKERKIT",
    pin: "I0",
  });

  ["down", "up", "hold"].forEach(function(type) {
    touch.on(type, function() {
      console.log(type);
    });
  });
});
