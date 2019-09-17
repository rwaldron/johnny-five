const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const led = new Led(11);

  led.fade({
    easing: "linear",
    duration: 1000,
    cuePoints: [0, 0.2, 0.4, 0.6, 0.8, 1],
    keyFrames: [0, 250, 25, 150, 100, 125],
    onstop() {
      console.log("Animation stopped");
    }
  });

  // Toggle the led after 2 seconds (shown in ms)
  board.wait(2000, () => led.fadeOut());
});
