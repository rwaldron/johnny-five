var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var relays = new five.Relays([3, 4, 5]);

  board.loop(2000, function() {
    // Toggle the state of all relays
    relays.toggle();
  });
});
