const {
  Board,
  Button,
  Expander,
  Led,
  Proximity,
  Sensor
} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("GROVEPI")
  );

  const proximity = new Proximity({
    board: virtual,
    controller: "ULTRASONIC_PING",
    pin: "D7"
  });

  proximity.on("change", () => {
    const {centimeters, inches} = proximity;
    console.log("Proximity: ");
    console.log("  cm  : ", centimeters);
    console.log("  in  : ", inches);
    console.log("-----------------");
  });

  const led = new Led({
    board: virtual,
    pin: "D3"
  });

  led.on();

  const a0 = new Sensor({
    pin: "A0",
    board: virtual
  });

  a0.on("change", () => {
    console.log(`a0: ${a0.value}`);
    led.brightness(a0.value >> 2);
  });

  const a2 = new Sensor({
    pin: "A2",
    board: virtual
  });

  a2.on("change", () => {
    console.log(`a2: ${a2.value}`);
  });

  const d6 = new Button({
    pin: "D6",
    board: virtual
  });

  d6.on("press", () => {
    console.log(`d6: press`);
  });

  d6.on("release", () => {
    console.log(`d6: release`);
  });

  const d2 = new Button({
    pin: "D2",
    board: virtual
  });

  d2.on("press", () => {
    console.log(`d2: press`);
  });

  d2.on("release", () => {
    console.log(`d2: release`);
  });
});
