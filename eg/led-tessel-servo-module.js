const { Board, Led } = require("../lib/johnny-five.js");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  const led = new Led({
    pin: process.argv[2] || 1,
    address: 0x73,
    port: "A",
    controller: "PCA9685"
  });

  // address: The address of the shield.
  //    Defaults to 0x40
  // pin: The pin the LED is connected to
  //    Defaults to 0
  // controller: The type of controller being used.
  //   Defaults to "standard".
  // port: The Tessel port being used "A" or "B"

  // Add LED to REPL (optional)
  board.repl.inject({ led });

  led.pulse();
});
