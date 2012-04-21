var five = require("../lib/johnny-five.js"),
    board;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var pin = 9,
      degrees = 10,
      incrementer = 10,
      last;

  this.firmata.pinMode( pin, 4 );

  setInterval(function() {

    if ( degrees >= 180 || degrees === 0 ) {
      incrementer *= -1;
    }

    degrees += incrementer;

    this.firmata.servoWrite( pin, degrees );

  }.bind(this), 50);
});
