<!--remove-start-->

# Expander - LIS3DH

<!--remove-end-->


Using an LIS3DH Expander as a Virtual Board (3 Pin Analog Input: 0.9V-1.8V)





##### Breadboard for "Expander - LIS3DH"



![docs/breadboard/expander-LIS3DH.png](breadboard/expander-LIS3DH.png)<br>

Fritzing diagram: [docs/breadboard/expander-LIS3DH.fzz](breadboard/expander-LIS3DH.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-LIS3DH.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var virtual = new five.Board.Virtual(
    new five.Expander("LIS3DH")
  );

  var sensor = new five.Sensor({
    pin: "A2",
    board: virtual
  });

  sensor.on("data", function() {
    console.log(sensor.value);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
