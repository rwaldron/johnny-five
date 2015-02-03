<!--remove-start-->
# Ping Component

Run with:
```bash
node eg/ping.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five"),
  board, ping;

board = new five.Board();

board.on("ready", function() {

  // Create a new `ping` hardware instance.
  ping = new five.Ping(7);

  // Properties

  // ping.microseconds
  //
  // Roundtrip distance in microseconds
  //

  // ping.inches
  //
  // Calculated distance to object in inches
  //

  // ping.cm
  //
  // Calculated distance to object in centimeters
  //


  // Ping Event API

  // "data" get the current reading from the ping
  ping.on("data", function(err, value) {
    console.log("data", value);
  });

  ping.on("change", function(err, value) {

    console.log(typeof this.inches);
    console.log("Object is " + this.inches + "inches away");
  });
});

```


## Breadboard/Illustration


![docs/breadboard/ping.png](breadboard/ping.png)
[docs/breadboard/ping.fzz](breadboard/ping.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
