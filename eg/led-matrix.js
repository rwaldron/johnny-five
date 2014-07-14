var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var heart = [
    "01100110",
    "10011001",
    "10000001",
    "10000001",
    "01000010",
    "00100100",
    "00011000",
    "00000000"
  ];

  var lc = new five.LedControl({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    },
    isMatrix: true
  });

  lc.on();

  var msg = "johnny-five".split("");

  function next() {
    var c;

    if (c = msg.shift()) {
      lc.draw(c);
      setTimeout(next, 500);
    }
  }

  next();

  this.repl.inject({
    lc: lc,
    heart: function() {
      lc.draw(heart);
    }
  });
});
