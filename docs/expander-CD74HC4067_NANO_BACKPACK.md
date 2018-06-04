<!--remove-start-->

# Expander - CD74HC4067, 16 Channel Analog Input Breakout

<!--remove-end-->


Using a CD74HC4067 connected to an Arduino Nano Backpack. Displays value of potentiometers in console graph. (`npm install barcli`)





##### Using 14 potentiometers!


The CD74HC4067 can accomodate up to 16 inputs


![docs/breadboard/expander-CD74HC4067-14-pots.png](breadboard/expander-CD74HC4067-14-pots.png)<br>

Fritzing diagram: [docs/breadboard/expander-CD74HC4067-14-pots.fzz](breadboard/expander-CD74HC4067-14-pots.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/expander-CD74HC4067_NANO_BACKPACK.js
```


```javascript
var Barcli = require("barcli");
var five = require("johnny-five");
var board = new five.Board({
  repl: false,
  debug: false,
});

board.on("ready", function() {

  // Use an Expander instance to create
  // a virtual Board.
  var virtual = new five.Board.Virtual(
    new five.Expander("CD74HC4067")
  );

  var inputs = ["A0", "A7", "A15"];

  inputs.forEach(function(input) {

    var bar = new Barcli({ label: input, range: [0, 1023] });

    // Initialize a Sensor instance with
    // the virtual board created above
    var sensor = new five.Sensor({
      pin: input,
      board: virtual
    });

    // Display all changes in the terminal
    // as a Barcli chart graph
    sensor.on("change", function() {
      bar.update(this.value);
    });
  });
});

```


## Illustrations / Photos


### Barcli output



![docs/images/CD74HC4067-3-pot-barcli.png](images/CD74HC4067-3-pot-barcli.png)  







## Learn More

- [I2C Backback Firmare](https://github.com/rwaldron/johnny-five/blob/master/firmwares/cd74hc4067_i2c_backpack.ino)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
