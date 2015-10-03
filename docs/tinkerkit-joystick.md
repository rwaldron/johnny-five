<!--remove-start-->

# TinkerKit - Joystick



Run with:
```bash
node eg/tinkerkit-joystick.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  Change = require("../eg/change");

new five.Board().on("ready", function() {
  // var servo = new five.Servo("O0");

  var joystick = {
    x: new five.Sensor({
      pin: "I0"
    }),
    y: new five.Sensor({
      pin: "I1"
    })
  };

  var changes = {
    x: new Change(),
    y: new Change()
  };

  var dirs = {
    x: {
      1: "left",
      3: "right"
    },
    y: {
      1: "down",
      3: "up"
    }
  };


  ["x", "y"].forEach(function(axis) {
    joystick[axis].scale(1, 3).on("change", function() {
      var round = Math.round(this.value);

      if (round !== 2 && changes[axis].isNoticeable(round)) {
        console.log(
          "%s changed noticeably (%d): %s", axis, round, dirs[axis][round]
        );
      } else {
        changes[axis].last = round;
      }
    });
  });
});


```








## Additional Notes
- [TinkerKit JoyStick](http://www.tinkerkit.com/joystick/)
- [TinkerKit Shield](http://www.tinkerkit.com/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
