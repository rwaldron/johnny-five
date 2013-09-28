var five = require("../lib/johnny-five.js"),
    board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo("O2");
  var lap = 0;

  servo.center();

  servo.sweep().on("sweep:full", function() {
    console.log( "lap", ++lap );

    if ( lap === 1 ) {
      this.sweep({
        range: [ 45, 135 ],
        step: 45
      });
    }

    if ( lap === 2 ) {
      this.sweep({
        range: [ 20, 160 ],
        step: 20
      });
    }

    if ( lap === 3 ) {
      this.sweep({
        range: [ 0, 179 ],
        interval: 10,
        step: 1
      });
    }

    if ( lap === 5 ) {
      process.exit(0);
    }
  });
});
