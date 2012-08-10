var five = require("../lib/johnny-five.js"),
    board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  // log out the slider values to the console.
  slider.scale( 0, 100 ).on("slide", function( err, value ) {
    if ( err ) {
      console.log( "error: ", err );
    } else {
      console.log( Math.floor(this.value) );
    }
  });
});
