const { Board, Expander, Sensor } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const virtual = new Board.Virtual(
    new Expander("LIS3DH")
  );

  const sensor = new Sensor({
    pin: "A2",
    board: virtual
  });

  sensor.on("change", value => {
    console.log("Sensor: ");
    console.log("  value  : ", sensor.value);
    console.log("-----------------");
  });
});
