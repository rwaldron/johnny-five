const { Board, Thermometer } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const temperature = new Thermometer({
    controller: "SHT31D"
  });

  temperature.on("change", () => {
    console.log(`${temperature.celsius}°C ${temperature.fahrenheit}°F`);
  });
});

/* @markdown
- [SHT31D - Humidity Sensor](https://www.adafruit.com/products/2857)
@markdown */
