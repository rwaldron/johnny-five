var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `joystick` hardware instance.
  var joystick = new five.Joystick({
    // Joystick pins are an array of pins
    // Pin orders:
    //   [ up, down, left, right ]
    //   [ ud, lr ]
    pins: ["A0", "A1"]
  });

  // Joystick Event API
  joystick.on("axismove", function() {

    // Axis data is available on:
    // this.axis
    // {
    //   x: 0...1, ( 0 <-- L/R --> 1 )
    //   y: 0...1  ( 0 <-- D/U --> 1 )
    // }
    //
    // Center is ~0.5
    //
    // console.log( "input", this.axis );
    // console.log( "LR:", this.axis.x, this.normalized.x );
    // console.log( "UD:", this.axis.y, this.normalized.y );
    // console.log( "MAG:", this.magnitude );

    console.log("LR:", this.fixed.x);
    console.log("UD:", this.fixed.y);
    console.log("MAG:", this.magnitude);

  });
});


// Schematic
// https://1965269182786388413-a-1802744773732722657-s-sites.googlegroups.com/site/parallaxinretailstores/home/2-axis-joystick/Joystick-6.png
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-Axis%20JoyStick_B%20Schematic.pdf

// Further Reading
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
