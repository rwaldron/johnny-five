var five = require("../lib/johnny-five.js"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    pin: "A0",
    controller: "OA41SK"
  });

  proximity.on("data", function(data) {
    console.log(data.cm + "cm");
  });

});
