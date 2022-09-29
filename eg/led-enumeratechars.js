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

  const shapes = Object.keys(Led.Matrix.CHARS);
  const enumerate = () => {
    let i = 0;
    board.loop(500, () => {
      if (i < shapes.length) {
        matrix.draw(Led.Matrix.CHARS[shapes[i]]);
        i++;
      }
    });
  };

  enumerate();

  this.repl.inject({
    matrix,
    enumerate
  });
});
