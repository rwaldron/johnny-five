<!--remove-start-->

# Micro Magician V2 - Servo

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/micromagician-servo.js
```


```javascript
var five = require("johnny-five");

var board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var servo = new five.Servo("A3");

  // Add servo to REPL (optional)
  this.repl.inject({
    servo: servo
  });

  // Servo API

  // min()
  //
  // set the servo to the minimum degrees
  // defaults to 0
  //
  // eg. servo.min();

  // max()
  //
  // set the servo to the maximum degrees
  // defaults to 180
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo to 90°
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to position by degrees
  //
  // servo.to( 90 );

  // step( deg )
  //
  // step all servos by deg
  //
  // eg. array.step( -20 );

  servo.sweep();

});

```









## Learn More

- [Micro Magician V2](http://www.dagurobot.com/goods.php?id=137)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
