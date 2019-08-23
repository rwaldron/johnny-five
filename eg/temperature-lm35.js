const {Board, Thermometer} = require("../lib/johnny-five");
const board = new Board();

board().on("ready", () => {
  const temperature = new Thermometer({
    controller: "LM35",
    pin: "A0"
  });

  temperature.on("change", () => {
    console.log(`${temperature.celsius}°C ${temperature.fahrenheit}°F`);
  });
});

/* @markdown
- [LM35 - Temperature Sensor](http://www.ti.com/product/lm35)
@markdown */
