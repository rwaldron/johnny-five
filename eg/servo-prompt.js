const {Board, Servo} = require("../lib/johnny-five.js");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const board = new Board();

board.on("ready", () => {
  const servo = new Servo(10);

  rl.setPrompt("SERVO TEST (0-180)> ");
  rl.prompt();

  rl.on("line", (line) => {
    servo.to(+line.trim());
    rl.prompt();
  }).on("close", () => process.exit(0));
});
