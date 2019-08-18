const {Board, Leds, Sensor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", function() {
  const leds = new Leds([2, 3, 4, 5, 6]);
  const pot = new Sensor("A0");

  pot.scale([-1, 4]).on("change", () => {
    const lastIndex = Math.round(pot.value);

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
