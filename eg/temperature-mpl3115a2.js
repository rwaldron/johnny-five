const { Board, Thermometer } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MPL3115A2"
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

/* @markdown
- [MPL3115A2 - I2C Barometric Pressure/Altimiter/Thermometer Sensor](https://www.adafruit.com/products/1893)
- [SparkFun Altitude/Pressure Sensor Breakout - MPL3115A2](https://www.sparkfun.com/products/11084)
- [SparkFun Weather Shield](https://www.sparkfun.com/products/12081)
- [SparkFun Photon Weather Shield](https://www.sparkfun.com/products/13630)
@markdown */
