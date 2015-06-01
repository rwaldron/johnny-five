var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "PCA9685"
  });

  var virtual = new five.Board.Virtual({
    io: expander
  });

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i * 2, board: virtual });
    })
  );

  leds.pulse();

  this.repl.inject({
    expander: expander,
    leds: leds
  });
});

