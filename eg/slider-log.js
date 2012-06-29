var five = require("../lib/johnny-five.js"),
    board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [ 0, 170 ];

  slider = new five.Sensor({
    pin: "A0",
    freq: 250
  });




  // log out the slider values to the console.
  slider.on("slide", function( err, value ) {
    if(err) {
      console.log("error: ", err);
    } else {
      console.log( Math.floor(this.value));
    }

  });
});
