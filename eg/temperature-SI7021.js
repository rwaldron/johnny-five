// Johnny Five version 2 is not supported on the Tessel 2.
// For using Johnny Five on the Tessel 2, stick with version 1 of Johnny Five.

const { Board, Thermometer } = require("../lib/johnny-five.js");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "SI7021",
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

