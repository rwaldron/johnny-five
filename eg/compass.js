var five = require("../");
var board = new five.Board();

board.on("ready", function() {

  var compass = new five.Compass({
    controller: "HMC6352"
  });

  // Or...
  // var compass = new five.Compass({
  //   controller: "HMC5883L"
  // });

  compass.on("headingchange", function() {
    console.log("headingchange");
    console.log("  heading : ", Math.floor(this.heading));
    console.log("  bearing : ", this.bearing.name);
    console.log("--------------------------------------");
  });

  compass.on("data", function() {
    console.log("  heading : ", Math.floor(this.heading));
    console.log("  bearing : ", this.bearing.name);
    console.log("--------------------------------------");
  });
});
