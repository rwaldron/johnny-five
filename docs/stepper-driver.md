<!--remove-start-->

# Stepper - Driver

<!--remove-end-->






##### Breadboard for "Stepper - Driver"



![docs/breadboard/stepper-driver.png](breadboard/stepper-driver.png)<br>

Fritzing diagram: [docs/breadboard/stepper-driver.fzz](breadboard/stepper-driver.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/stepper-driver.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  /**
   * In order to use the Stepper class, your board must be flashed with
   * either of the following:
   *
   * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
   * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
   *
   */

  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 11,
      dir: 13
    }
  });

  // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper.rpm(180).ccw().accel(1600).decel(1600).step(2000, function() {

    console.log("Done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper.step({
      steps: 2000,
      direction: five.Stepper.DIRECTION.CW
    }, function() {
      console.log("Done moving CW");
    });
  });
});


```








## Additional Notes
- [A4988 Stepper Motor Driver Carrier](http://www.pololu.com/catalog/product/1182)
- [100uf 35v electrolytic cap](http://www.amazon.com/100uF-Radial-Mini-Electrolytic-Capacitor/dp/B0002ZP530)
- [Stepper Motor (4 wire, bipolar)](https://www.sparkfun.com/products/9238)

![docs/breadboard/stepper-driver-A4988.png](breadboard/stepper-driver-A4988.png)


&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
