var five = require("../lib/johnny-five.js"),
  keypress = require("keypress"),
  board;

keypress(process.stdin);

board = new five.Board();

board.on("ready", function() {

  console.log("Let's test a simple servo. Use Up and Down arrows for CW and CCW respectively. Space to stop.");

  var servo = new five.Servo({
    pin: "10",
    type: "continuous"
  }).stop();

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", function(ch, key) {

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
