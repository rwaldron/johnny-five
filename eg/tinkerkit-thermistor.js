var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  new five.Thermometer({
    controller: "TINKERKIT",
    pin: "I0"
  }).on("change", function() {
    console.log("F: ", this.fahrenheit);
    console.log("C: ", this.celsius);
  });
});
