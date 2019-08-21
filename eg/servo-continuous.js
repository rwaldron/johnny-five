const {Board, Servo} = require("../lib/johnny-five.js");
const keypress = require("keypress");

keypress(process.stdin);

const board = new Board();

board.on("ready", () => {

  console.log("Use Up and Down arrows for CW and CCW respectively. Space to stop.");

  const servo = new Servo.Continuous(10);

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", (ch, key) => {

    if (!key) {
      return;
    }

    if (key.name === "q") {
      console.log("Quitting");
      process.exit();
    } else if (key.name === "up") {
      console.log("CW");
      servo.cw();
    } else if (key.name === "down") {
      console.log("CCW");
      servo.ccw();
    } else if (key.name === "space") {
      console.log("Stopping");
      servo.stop();
    }
  });
});
