<!--remove-start-->

# TinkerKit - Joystick

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-joystick.js
```


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









## Learn More

- [TinkerKit JoyStick](http://tinkerkit.tihhs.nl/joystick/)

- [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
