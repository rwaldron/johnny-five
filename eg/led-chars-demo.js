const { Board, Led } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {

  const matrix = new Led.Matrix({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    }
  });

  matrix.on();

  // type `draw("shape_name")` into the repl to see the shape!
  board.repl.inject({
    matrix,
    draw(shape) {
      matrix.draw(Led.Matrix.CHARS[shape]);
    }
  });
});
