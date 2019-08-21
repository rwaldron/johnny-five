const {Board, Leds, Sensor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const leds = new Leds([2, 3, 4, 5, 6]);
  const pot = new Sensor("A0");

  pot.on("change", () => {
    const lastIndex = Math.round(pot.scaleTo([-1, 4]));

    if (lastIndex === -1) {
      leds.off();
    } else {
      leds.each((led, index) => {
        if (index <= lastIndex) {
          led.on();
        } else {
          led.off();
        }
      });
    }
  });
});
