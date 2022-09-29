const { Board, Thermometer } = require("../lib/johnny-five.js");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "SI7020",
    port: "A"
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

