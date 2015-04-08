var five = require("../lib/johnny-five.js"),
  prox, led;

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    pin: "A0",
    controller: "OA41SK",
    freq: 250
  });

  proximity.on("data", function(err, data) {
    console.log(data.cm + 'cm');
  });

});
