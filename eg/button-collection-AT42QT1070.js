var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var buttons = new five.Buttons({
    pins: [2, 3, 4, 5, 6],
    invert: true,
  });

  buttons.on("press", function(button) {
    console.log("Pressed: ", button.pin);
  });

  buttons.on("release", function(button) {
    console.log("Released: ", button.pin);
  });
});
