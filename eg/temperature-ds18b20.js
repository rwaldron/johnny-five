const { Board, Thermometer } = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  // This requires OneWire support using ConfigurableFirmata
  const thermometer = new Thermometer({
    controller: "DS18B20",
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
- [DS18B20 - Thermometer Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)
@markdown */
