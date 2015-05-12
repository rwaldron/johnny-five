var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var expander = new five.Expander({
    controller: "PCF8574"
  });

  var virtual = new five.Board.Virtual({
    io: expander
  });

  var leds = new five.Leds(
    Array.from({ length: 8 }, function(_, i) {
      return new five.Led({ pin: i, board: virtual });
    })
  );

  leds.on();

  this.repl.inject({
    expander: expander,
    leds: leds
  });
});

