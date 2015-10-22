var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var sonar = new five.Sonar({
    device: "SRF10"
  });

  function display(type, value, unit) {
    console.log("%s event: object is %d %s away", type, value, unit);
  }

  sonar.on("data", function() {
    display("data", this.inches, "inches");
  });

  sonar.on("change", function() {
    display("data", this.inches, "inches");
  });
});
