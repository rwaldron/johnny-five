const { Board, Thermometer } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // This requires OneWire support using the ConfigurableFirmata
  const thermometer = new Thermometer({
    controller: "MAX31850K",
    pin: 2
  });

  thermometer.on("change", () => {
    const {address, celsius, fahrenheit, kelvin} = thermometer;
    console.log(`Thermometer at address: 0x${address.toString(16)}`);
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");
  });
});

/* @markdown
- [MAX31850K - Thermocouple Amplifier](https://www.adafruit.com/products/1727)
@markdown */
