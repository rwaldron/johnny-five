var five = require("../");
var board = new five.Board();

board.on("ready", function() {

  var relay = new five.Relay({
    pin: "A2"
  });

  setInterval(function() {
    relay.toggle();
  }, 1000);
});
