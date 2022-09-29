const { Board, Expander, Leds } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("MCP23017")
  );

  const leds = new Leds(
    Array.from(Array(8), (_, i) =>
      ({ pin: i * 2, board: virtual })
    )
  );

  leds.blink(500);

  board.repl.inject({
    leds
  });
});
