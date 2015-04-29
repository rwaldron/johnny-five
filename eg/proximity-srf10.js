var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "SRF10"
  });

  proximity.on("data", function(data) {
    console.log(data.cm + "cm", data.in + "in");
  });

  proximity.on("change", function(data) {
    console.log("The obstruction has moved.");
  });

});
