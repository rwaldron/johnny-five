var five = require("../lib/johnny-five.js"),
    board, joystick, led;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `joystick` hardware instance.
  // This example allows the joystick module to
  // create a completely default instance
  joystick = new five.Joystick({
    // Joystick pins are an array of pins
    // Pin orders:
    //   [ up, down, left, right ]
    //   [ ud, lr ]
    pins: [ "A0", "A1" ]
  });

  led = new five.Led();


  // Inject the `joystick` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    joystick: joystick
  });

  // Joystick Event API

  joystick.on("axismove", function( err, event ) {

    // Axis data is available on:
    // this.axis
    // { x: 0-1024, y: 0-1024 }
    console.log( "input", this.axis );

    led.strobe();
  });
});


// Schematic
// https://1965269182786388413-a-1802744773732722657-s-sites.googlegroups.com/site/parallaxinretailstores/home/2-axis-joystick/Joystick-6.png?attachauth=ANoY7cpvldS6bVVIJbeQnCa9w-UoVst9yaVSMQ96K_rlO-DLD0IJaAUbj1y148obuy1sIEiXxkDS2vSMek4zeq4M6bleDHfmCh35zGKxxFDllTVZuey57vhw-LssfaRxiU090BuAutY8081PD-65bZWpRy5gZpId77nuPEGbOQFeVEJYK41ltByfpVYUe9PO3rQwbf3XK_ltPHZv8fyXH43UMu5HJE04PS0QDHPyoICTvgzHO-DIbfHY32Znf9SsAMm5nLtag3h1&attredirects=0

// Further Reading
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
