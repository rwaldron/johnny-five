var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var open = [
    "0000000000000000",
    "0011110000111100",
    "0100001001000010",
    "1001100110011001",
    "1001100110011001",
    "0100001001000010",
    "0011110000111100",
    "0000000000000000",
  ];

  var wink = [
    "0000000000000000",
    "0011110000000000",
    "0100001000000000",
    "1001100111111111",
    "1001100111111111",
    "0100001000000000",
    "0011110000000000",
    "0000000000000000",
  ];


  var matrix = new five.Led.Matrix({
    addresses: [0x70],
    controller: "HT16K33",
    dims: "8x16",
    rotation: 2
  });

  matrix.draw(open);

  this.repl.inject({
    wink: function() {
      matrix.draw(wink);

      setTimeout(function() {
        matrix.draw(open);
      }, 500);
    }
  });
});
