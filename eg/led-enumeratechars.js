var five = require("../lib/johnny-five");

var board = new five.Board();

board.on("ready", function() {

  var matrix = new five.Led.Matrix({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    }
  });

  matrix.on();

  var shapes = Object.keys(five.Led.Matrix.CHARS);

  var enumerate = function() {
    var i = 0;
    board.loop(500, function() {
      if (i < shapes.length) {
        matrix.draw(five.Led.Matrix.CHARS[shapes[i]]);
        i++;
      }
    });
  };

  enumerate();

  this.repl.inject({
    matrix: matrix,
    enumerate: enumerate
  });
});
