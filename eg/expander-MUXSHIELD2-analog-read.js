const Barcli = require("barcli");
const { Board, Expander, Sensor } = require("../lib/johnny-five.js");
const board = new Board({
  repl: false,
  debug: false
});

board.on("ready", () => {
  const range = [0, 1023];
  const bars = {
    a: new Barcli({ label: "IO1-15", range }),
    b: new Barcli({ label: "IO2-15", range }),
  };

  const virtual = new Board.Virtual(
    new Expander("MUXSHIELD2")
  );

  const a = new Sensor({
    pin: "IO1-15",
    board: virtual
  });

  a.on("change", () => {
    bars.a.update(a.value);
  });

  const b = new Sensor({
    pin: "IO2-15",
    board: virtual
  });

  b.on("change", () => {
    bars.b.update(b.value);
  });
});
