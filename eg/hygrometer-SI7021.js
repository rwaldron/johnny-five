var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "SI7021"
  });

  hygrometer.on("data", function() {
    console.log(this.relativeHumidity + " %");
  });
});
