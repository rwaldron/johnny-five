const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const temperature = new Thermometer({
    controller: "TMP102"
  });

  temperature.on("change", () => {
    console.log(`${temperature.celsius}°C ${temperature.fahrenheit}°F`);
  });
});

/* @markdown
- [TMP102 - Temperature Sensor](https://www.sparkfun.com/products/11931)
@markdown */
