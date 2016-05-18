var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  // The "shared property" interface, allows
  // writing a more succint initialization,
  // as it's effectively a short hand for:
  //
  // var buttons = new five.Buttons([
  //   { pin: 2, invert: true },
  //   { pin: 3, invert: true },
  //   { pin: 4, invert: true },
  //   { pin: 5, invert: true },
  //   { pin: 6, invert: true },
  // });
  //
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
