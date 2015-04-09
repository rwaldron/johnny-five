var five = require("johnny-five.js"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "SRF10"
  });

  proximity.on("data", function(data) {
    console.log(data.cm + "cm");
  });

});
