<!--remove-start-->

# Sensor - Potentiometer



Run with:
```bash
node eg/potentiometer.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  board, potentiometer;

board = new five.Board();

board.on("ready", function() {

  // Create a new `potentiometer` hardware instance.
  potentiometer = new five.Sensor({
    pin: "A2",
    freq: 250
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: potentiometer
  });

  // "data" get the current reading from the potentiometer
  potentiometer.on("data", function() {
    console.log(this.value, this.raw);
  });
});


// References
//
// http://arduino.cc/en/Tutorial/AnalogInput

```


## Illustrations / Photos


### Breadboard for "Sensor - Potentiometer"



![docs/breadboard/potentiometer.png](breadboard/potentiometer.png)<br>

Fritzing diagram: [docs/breadboard/potentiometer.fzz](breadboard/potentiometer.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
