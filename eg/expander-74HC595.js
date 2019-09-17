const { Board, Expander, Leds } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  const expander = new Expander({
    controller: "74HC595",
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  const virtual = new Board.Virtual(expander);
  const leds = new Leds(
    Array.from(Array(8), (_, pin) =>
      ({ pin, board: virtual })
    )
  );

  leds.blink(500);

  board.repl.inject({
    leds
  });
});
