const {Board, Sonar} = require("../lib/johnny-five.js");
var board = new Board();

board.on("ready", () => {

  var sonar = new Sonar({
    device: "SRF10"
  });

  function display(type, value, unit) {
    console.log(`${type} event: object is ${value} ${unit} away`);
  }

  sonar.on("data", () => display("data", sonar.inches, "inches"));
  sonar.on("change", () => display("data", sonar.inches, "inches"));
});
