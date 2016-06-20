var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  new five.Led("O0").strobe(250);
});
