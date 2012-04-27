var five = require("../lib/johnny-five.js"),
    board;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var claw = new five.Servo({ pin: 9 }),
      arm =  new five.Servo({ pin: 10 }),
      degrees = 10,
      incrementer = 10,
      last;

  this.loop( 25, function() {

    if ( degrees >= 180 || degrees === 0 ) {
      incrementer *= -1;
    }

    degrees += incrementer;

    if ( degrees === 180 ) {
      if ( !last || last === 90 ) {
        last = 180;
      } else {
        last = 90;
      }
      arm.move( last );
    }

    claw.move( degrees );
  });
});
