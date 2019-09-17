const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const anode = new Led.RGB({
    pins: {
      red: 6,
      green: 5,
      blue: 3
    },
    isAnode: true
  });

  // Add led to REPL (optional)
  board.repl.inject({ anode });

  // Turn it on and set the initial color
  anode.on();
  anode.color("#FF0000");

  anode.blink(1000);
});
