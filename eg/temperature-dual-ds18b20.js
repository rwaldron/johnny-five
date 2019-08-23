const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

const controller = "DS18B20";

board.on("ready", () => {
  // This requires OneWire support using the ConfigurableFirmata
  const thermometerA = new Thermometer({
    controller,
    pin: 2,
    address: 0x687f1fe
  });

  const thermometerB = new Thermometer({
    controller,
    pin: 2,
    address: 0x6893a41
  });


  thermometerA.on("change", () => {
    console.log(`A ${thermometerA.celsius}°C`);
  });

  thermometerB.on("change", () => {
    console.log(`B ${thermometerB.celsius}°C`);
  });
});

/* @markdown
// - [DS18B20 - Temperature Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)
@markdown */
