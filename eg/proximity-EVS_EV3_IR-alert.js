const { Board, Led, Leds, Proximity } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "EVS_EV3_IR",
    pin: "BAS1"
  });
  const red = new Led(10);
  const green = new Led(11);
  const leds = new Leds([red, green]);

  green.on();

  proximity.on("change", () => {
    if (proximity.cm < 35) {
      if (!red.isOn) {
        leds.toggle();
      }
    } else if (!green.isOn) {
      leds.toggle();
    }
  });
});
