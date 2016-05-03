var Tessel = require("tessel-io");
var five = require("../");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {

  var compass = new five.Compass({
    controller: "MAG3110",
    // Optionally pre-load the offsets
    offsets: {
      x: [-819, -335],
      y: [702, 1182],
      z: [-293, -13],
    },
  });

  compass.on("calibrated", function(offsets) {
    // Use this data with the optional "offsets" property above
    console.log("calibrated:", offsets);
  });

  compass.on("change", function() {
    console.log("change");
    console.log("  heading : ", Math.floor(this.heading));
    console.log("  bearing : ", this.bearing.name);
    console.log("--------------------------------------");
  });
});

