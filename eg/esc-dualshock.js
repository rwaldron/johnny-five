const { Board, ESC, Fn } = require("../lib/johnny-five.js");
const dualShock = require("dualshock-controller");

const board = new Board();
const controller = dualShock({
  config: "dualShock3",
  analogStickSmoothing: false
});

board.on("ready", () => {
  const esc = new ESC(9);
  let speed = 0;
  let last = null;

  controller.on("connected", () => {
    controller.isConnected = true;
  });

  controller.on("dpadUp:press", () => {
    if (last !== "up") {
      speed = 0;
    } else {
      speed += 1;
    }
    esc.throttle(esc.neutral + speed);
    last = "up";
  });

  controller.on("dpadDown:press", () => {
    if (last !== "down") {
      speed = 0;
    } else {
      speed += 1;
    }
    esc.throttle(esc.neutral - speed);
    last = "down";
  });

  controller.on("circle:press", () => {
    last = null;
    speed = 0;
    esc.brake();
  });

  controller.on("right:move", position => {
    const y = Fn.scale(position.y, 255, 0, 0, 180) | 0;

    if (y > 100) {
      // from the deadzone and up
      esc.throttle(Fn.scale(y, 100, 180, 0, 100));
    }
  });

  controller.connect();
});

// Brushless motor breadboard diagram originally published here:
// http://robotic-controls.com/learn/projects/dji-esc-and-brushless-motor
