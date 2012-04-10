var five = require("../lib/johnny-five.js"),
    board, repl;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var claw = 9,
      arm = 11,
      degrees = 10,
      incrementer = 10,
      last;

  this.firmata.pinMode( claw, 4 );
  this.firmata.pinMode( arm, 4 );

  setInterval(function() {

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
      this.firmata.servoWrite( arm, last );
    }

    this.firmata.servoWrite( claw, degrees );

  }.bind(this), 50);
});
