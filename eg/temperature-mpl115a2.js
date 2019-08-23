const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MPL115A2"
  });

  thermometer.on("change", () => {
    console.log(`Thermometer
  celsius      : ${thermometer.celsius}
  fahrenheit   : ${thermometer.fahrenheit}
  kelvin       : ${thermometer.kelvin}
--------------------------------------`);
  });
});

/* @markdown
- [MPL115A2 - I2C Barometric Pressure/Temperature Sensor](https://www.adafruit.com/product/992)
@markdown */
