const { Board, Thermometer } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "BMP180",
    freq: 250
  });

  thermometer.on("change", () => {
    const {celsius, fahrenheit, kelvin} = thermometer;
    console.log("Thermometer");
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");
  });
});
