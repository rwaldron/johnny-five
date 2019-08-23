const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const temperature = new Thermometer({
    controller: "TMP36",
    pin: "A0"
  });

  temperature.on("change", () => {
    console.log(`${temperature.celsius}°C ${temperature.fahrenheit}°F`);
  });
});

/* @markdown
- [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)
@markdown */
