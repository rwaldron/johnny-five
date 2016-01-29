var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "74HC595",
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var virtual = new five.Board.Virtual(expander);
  var leds = new five.Leds({
    pins: [0, 1, 2, 3, 4, 5, 6, 7],
    board: virtual
  });

  leds.blink(500);
});
