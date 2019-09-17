const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // Initialize the RGB LED
  const led = new Led.RGB({
    pins: {
      red: 6,
      green: 5,
      blue: 3
    }
  });

  // RGB LED alternate constructor
  // This will normalize an array of pins in [r, g, b]
  // order to an object (like above) that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  // const led = new Led.RGB([3,5,6]);

  // Add led to REPL (optional)
  board.repl.inject({ led });

  // Turn it on and set the initial color
  led.on();
  led.color("#FF0000");

  led.blink(1000);
});
