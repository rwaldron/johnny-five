var five = require("../lib/johnny-five.js"),
    compass, servo;

five.Board().on("ready", function() {

  [
    [ 91, "ccw" ],
    [ 89, "cw" ]

  ].forEach(function( def ) {
    five.Servo.prototype[ def[1] ] = function() {
      this.move( def[0] );
    };
  });

  // servo = new five.Servo({
  //   pin: 9,
  //   type: "continuous"
  // });

  // this.repl.inject({
  //   servo: servo
  // });

  // servo.center();



  compass = new five.Magnetometer();

  compass.on("read", function() {

    // console.log( this.axis );
    console.log( "heading", Math.floor(this.heading) );
  });
});
