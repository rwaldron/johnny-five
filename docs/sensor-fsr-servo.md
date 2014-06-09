# Sensor Fsr Servo

Run with:
```bash
node eg/sensor-fsr-servo.js
```


```javascript
var five = require("johnny-five"),
  board, fsr, servo;

board = new five.Board();

board.on("ready", function() {

  // Create a new `fsr` hardware instance.
  fsr = new five.Sensor({
    pin: "A0",
    freq: 25
  });

  servo = new five.Servo(10);

  fsr.scale([0, 180]).on("data", function() {

    servo.to(this.value);

  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
