const { Board, Sensor } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const potentiometer = new Sensor("A3");

  potentiometer.on("change", () => {
    const {value, raw} = potentiometer;
    console.log("Sensor: ");
    console.log("  value  : ", value);
    console.log("  raw    : ", raw);
    console.log("-----------------");
  });
});


// References
//
// http://arduino.cc/en/Tutorial/AnalogInput
