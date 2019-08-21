const {Board, Motor, Fn} = require("../lib/johnny-five.js");
const keypress = require("keypress");
const board = new Board();

board.on("ready", () => {
  let speed = 100;
  let commands = null;
  const motors = {
    a: new Motor([3, 12]),
    b: new Motor([11, 13])
  };

  board.repl.inject({
    motors
  });

  function controller(ch, key) {
    if (key) {
      if (key.name === "space") {
        motors.a.stop();
        motors.b.stop();
      }
      if (key.name === "up") {
        motors.a.rev(speed);
        motors.b.fwd(speed);
      }
      if (key.name === "down") {
        motors.a.fwd(speed);
        motors.b.rev(speed);
      }
      if (key.name === "right") {
        motors.a.fwd(speed * 0.75);
        motors.b.fwd(speed * 0.75);
      }
      if (key.name === "left") {
        motors.a.rev(speed * 0.75);
        motors.b.rev(speed * 0.75);
      }

      commands = Array.from(arguments);
    } else {
      if (ch >= 1 && ch <= 9) {
        speed = Fn.scale(ch, 1, 9, 0, 255);
        controller(...commands);
      }
    }
  }


  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

/* @markdown

![Chassis](https://cdn.sparkfun.com//assets/parts/9/7/3/8/12866-01.jpg)

![ArduMoto](https://cdn.sparkfun.com//assets/parts/3/8/4/9/09815-01.jpg)

@markdown */
