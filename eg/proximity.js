var five = require("../lib/johnny-five.js"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
      pin: "A0",
      device: "OA41SK"
    });

  proximity.on("data", function() {
      console.log("cm: ", this.centimeters, this.raw);
  });

});
