var five = require("../lib/johnny-five.js"),
    board, slider, tilt, scalingRange;

board = five.Board({
  debug: true
});

board.on("ready", function() {

  scalingRange = [ 0, 170 ];

  slider = five.Sensor({
    pin: "A0",
    freq: 50
  });

  tilt = five.Servo({
    pin: 9,
    range: scalingRange
  });

  slider.scale( scalingRange ).on("slide", function( err, value ) {

    // The slider's value will be scaled to match the tilt servo range

    tilt.move( Math.floor(this.value) );

  });
});
