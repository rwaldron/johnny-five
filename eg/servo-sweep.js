const {Board, Servo} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const servo = new Servo({
    pin: 10,
    startAt: 90
  });
  let lap = 0;

  servo.sweep().on("sweep:full", () => {
    console.log(`lap ${++lap}`);

    if (lap === 1) {
      servo.sweep({
        range: [40, 140],
        step: 10
      });
    }

    if (lap === 2) {
      servo.sweep({
        range: [60, 120],
        step: 5
      });
    }

    if (lap === 3) {
      servo.sweep({
        range: [80, 100],
        step: 1
      });
    }

    if (lap === 5) {
      process.exit(0);
    }
  });
});
