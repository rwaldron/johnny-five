var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  var piezo = new five.Piezo(3);

  board.repl.inject({
    piezo: piezo
  });

  piezo.song("cdfda ag cdfdg gf ", "111111442111111442");
});
