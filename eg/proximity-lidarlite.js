var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {

  var proximity = new five.Proximity({
    controller: "LIDARLITE"
  });

  // proximity.on("data", function(data) {
    // console.log(data.cm + "cm", data.in + "in");
  // });

  proximity.on("change", function() {
    console.log(this.cm + "cm");
  });

});
