const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "HTU21D"
  });

  thermometer.on("change", () => {
    console.log(`${thermometer.celsius}°C ${thermometer.fahrenheit}°F`);
  });
});

/* @markdown
- [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)
@markdown */
