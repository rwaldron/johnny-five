var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var pin = new five.Pin(14);
  pin.high();
});
