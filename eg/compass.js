var five = require("../lib/johnny-five.js"),
    compass;

five.Board().on("ready", function() {

  compass = new five.Compass({
    device: "HMC5883L",
    freq: 500
  });


  compass.on("read", function() {

    console.log( this.heading );

  });
});
