var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var laser = new five.Led(9);

  board.repl.inject({
    laser: laser
  });
});
