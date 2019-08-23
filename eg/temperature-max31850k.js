const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // This requires OneWire support using the ConfigurableFirmata
  const temperature = new Thermometer({
    controller: "MAX31850K",
    pin: 2
  });

  temperature.on("change", () => {
    console.log(`temperature at address: 0x${temperature.address.toString(16)}
  celsius      : ${temperature.celsius}
  fahrenheit   : ${temperature.fahrenheit}
  kelvin       : ${temperature.kelvin}
--------------------------------------`);
  });
});

/* @markdown
- [MAX31850K - Thermocouple Amplifier](https://www.adafruit.com/products/1727)
@markdown */
