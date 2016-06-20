var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  new five.Sensor("I0").scale(0, 255).on("data", function() {
    console.log(Math.round(this.value));
  });
});
