const {Board, ESC, Fn, Led} = require("../lib/johnny-five.js");
const keypress = require("keypress");

const board = new Board();

board.on("error", error => {
  console.error(error);
  process.exit(1);
});

board.on("ready", () => {
  const led = new Led(13);
  const esc = new ESC({
    device: "FORWARD_REVERSE",
    pin: 11,
  });
  let speed = 0;
  let last = null;

  // just to make sure the program is running
  led.blink(500);

  function controller(_, key) {
    let change = 0;

    if (key) {
      if (!key.shift) {
        change = esc.neutral;
        speed = 0;
      } else {
        if (key.name === "up" || key.name === "down") {
          if (last !== key.name) {
            change = esc.neutral;
            speed = 0;
          } else {
            speed += 1;

            change = key.name === "up" ?
              esc.neutral + speed :
              esc.neutral - speed;
          }
          last = key.name;
        }
      }

      if (change) {
        esc.throttle(change);
      }
    }
  }

  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});
