const { Board, Sensor } = require("../");
const board = new Board();

board.on("ready", () => {
  // The "custom" property is available
  // to all component class constructors
  const sensor = new Sensor({
    pin: "A0",
    custom: {
      a: 1,
      b: 2,
    }
  });

  console.log(sensor.custom.a);
  console.log(sensor.custom.b);
});
