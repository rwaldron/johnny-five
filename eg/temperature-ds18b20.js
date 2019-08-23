const {Board, Thermometer} = require("../lib/johnny-five");
const board = new Board();

board.on("ready", () => {
  // This requires OneWire support using ConfigurableFirmata
  const thermometer = new Thermometer({
    controller: "DS18B20",
    pin: 2
  });

  thermometer.on("change", () => {
    console.log(`${thermometer.celsius}°C`);
    // console.log("0x" + this.address.toString(16));
  });
});

/* @markdown
- [DS18B20 - Temperature Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)
@markdown */
