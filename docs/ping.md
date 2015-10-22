<!--remove-start-->

# Ping

<!--remove-end-->






##### Breadboard for "Ping"



![docs/breadboard/ping.png](breadboard/ping.png)<br>

Fritzing diagram: [docs/breadboard/ping.fzz](breadboard/ping.fzz)

&nbsp;




Run with:
```bash
node eg/ping.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `ping` hardware instance.
  var ping = new five.Ping(7);

  // Properties

  // ping.in/ping.inches
  //
  // Calculated distance to object in inches
  //

  // ping.cm
  //
  // Calculated distance to object in centimeters
  //

  ping.on("change", function() {
    console.log("Object is " + this.in + " inches away");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
