var Barcli = require("barcli");
var five = require("../lib/johnny-five.js");
var board = new five.Board({
  repl: false,
  debug: false
});

board.on("ready", function() {
  var bars = {
    a: new Barcli({
      label: "IO1-15",
      range: [0, 1023]
    }),
    b: new Barcli({
      label: "IO2-15",
      range: [0, 1023]
    }),
  };

  var virtual = new five.Board.Virtual(
    new five.Expander("MUXSHIELD2")
  );

  var a = new five.Sensor({
    pin: "IO1-15",
    board: virtual
  });

  a.on("change", function() {
    bars.a.update(this.value);
  });

  var b = new five.Sensor({
    pin: "IO2-15",
    board: virtual
  });

  b.on("change", function() {
    bars.b.update(this.value);
  });
});
