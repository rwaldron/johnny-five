var five = require("../lib/johnny-five.js"),
  board, compass;

board = new five.Board();

board.on("ready", function() {

  compass = new five.Compass({
    device: "HMC6352",
    //device: "HMC5883L",
    freq: 100,
    gauss: 1.3
  });

  compass.on("headingchange", function() {

    console.log("heading", Math.floor(this.heading));
    console.log("bearing", this.bearing);
  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  compass.on("data", function(err, timestamp) {
    console.log("data", this.axis);
  });
});
