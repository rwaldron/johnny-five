# Claw

Run with:
```bash
node eg/claw.js
```


```javascript
var five = require("johnny-five"),
  board;

board = new five.Board();

board.on("ready", function() {

  var claw = new five.Servo({
    pin: 9
  }),
    arm = five.Servo({
      pin: 10
    }),
    degrees = 10,
    incrementer = 10,
    last;

  this.loop(25, function() {

    if (degrees >= 180 || degrees === 0) {
      incrementer *= -1;
    }

    degrees += incrementer;

    if (degrees === 180) {
      if (!last || last === 90) {
        last = 180;
      } else {
        last = 90;
      }
      arm.to(last);
    }

    claw.to(degrees);
  });
});


// Claw Assembly Instructions
// http://blasphemousbits.wordpress.com/2011/11/05/sparkfun-robot-claw/

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
