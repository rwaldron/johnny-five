var five = require("../lib/johnny-five.js"),
    board, pan, tilt, joystick, array;

board = new five.Board({
  debug: true
});

board.on("ready", function() {


  pan = new five.Servo({
    pin: 9,
    range: [ 0, 170 ]
  });

  tilt = new five.Servo({
    pin: 10,
    range: [ 0, 170 ]
  });

  joystick = new five.Joystick({
    pins: [ "A0", "A1" ],
    freq: 250
  });

  (new five.Servos()).center();

  joystick.on("axismove", function() {

    tilt.move( Math.ceil(170 * this.fixed.y) );
    pan.move( Math.ceil(170 * this.fixed.x) );

  });
});
