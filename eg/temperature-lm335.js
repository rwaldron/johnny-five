const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "LM335",
    pin: "A0"
  });

  thermometer.on("change", () => {
    console.log(`${thermometer.celsius}°C ${thermometer.fahrenheit}°F`);
  });
});

/* @markdown
- [LM335 - Temperature Sensor](http://www.ti.com/product/lm335)
@markdown */
