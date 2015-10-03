<!--remove-start-->

# Joystick



Run with:
```bash
node eg/joystick.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
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

```


## Illustrations / Photos


### Joystick - Sparkfun


Sparkfun joystick breakout board.


![docs/breadboard/joystick-sparkfun.png](breadboard/joystick-sparkfun.png)<br>

Fritzing diagram: [docs/breadboard/joystick-sparkfun.fzz](breadboard/joystick-sparkfun.fzz)

&nbsp;
### Joystick - Adafruit


Adafruit joystick breakout board.


![docs/breadboard/joystick-adafruit.png](breadboard/joystick-adafruit.png)<br>

Fritzing diagram: [docs/breadboard/joystick-adafruit.fzz](breadboard/joystick-adafruit.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
