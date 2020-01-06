<!--remove-start-->

# Line Follower

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/line-follower.js
```


```javascript
// This is an example of a line following robot.  It uses a
// Pololu QTR-8A reflectance array to read a line on my
// counter drawn with electrical tape.  You can see the
// bot in action here: https://www.youtube.com/watch?v=i6n4CwqQer0

var fs = require("fs");
var five = require("johnny-five");
var board = new five.Board();

// Setup Standard input.  We use this to let the bot know that we"ve finished
// calibrating
var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();

var calibrationFile = ".calibration";

// VERY simple driving rules.  It uses a mapping from the line value that comes
// from the Reflectance Array to the left and right wheel of the bot.
// This can be made much better, but it is a good start.
var drivingRules = {
  0: {
    left: {
      dir: "cw",
      speed: 0.01
    },
    right: {
      dir: "ccw",
      speed: 0.07
    }
  },

  1000: {
    left: {
      dir: "cw",
      speed: 0.02
    },
    right: {
      dir: "ccw",
      speed: 0.05
    }
  },

  2000: {
    left: {
      dir: "cw",
      speed: 0.04
    },
    right: {
      dir: "ccw",
      speed: 0.05
    }
  },

  2500: {
    left: {
      dir: "cw",
      speed: 0.05
    },
    right: {
      dir: "ccw",
      speed: 0.05
    }
  },

  3000: {
    left: {
      dir: "cw",
      speed: 0.05
    },
    right: {
      dir: "ccw",
      speed: 0.04
    }
  },

  4000: {
    left: {
      dir: "cw",
      speed: 0.05
    },
    right: {
      dir: "ccw",
      speed: 0.02
    }
  },

  5001: {
    left: {
      dir: "cw",
      speed: 0.07
    },
    right: {
      dir: "ccw",
      speed: 0.01
    }
  }
};

board.on("ready", function() {

  // Create an instance of the reflectance array.
  var eyes = new five.IR.Reflect.Collection({
    emitter: 13,
    pins: ["A0", "A1", "A2", "A3", "A4", "A5"],
    freq: 20
  });

  // These are the continuous servos that control the wheels
  var wheels = {
    left: new five.Servo.Continuous(10),
    right: new five.Servo.Continuous(9)
  };

  // Make the eyes and wheels available in the REPL UI
  this.repl.inject({
    eyes: eyes,
    wheels: wheels
  });

  // When the bot starts up, enable the IR emitters and tell the wheels
  // to stop.  Calibrate the device.  When complete, drive.
  function init() {
    eyes.enable();
    wheels.left.stop();
    wheels.right.stop();

    calibrate(drive);
  }

  // Calibrate the bot.  If the calibration has been persisted, use it.
  // If not, calibrate the bot until the user presses a key.  Move the sensor
  // over light and dark regions several times.  Persist the calibration data
  // to a file so it doesn"t need to do it again next time.
  function calibrate(whenComplete) {
    var savedCalibration, calibrating = true;

    if (fs.existsSync(calibrationFile)) {
      eyes.loadCalibration(JSON.parse(fs.readFileSync(calibrationFile)));
      whenComplete();
      return;
    }

    console.log("Calibrating.  Press a key...");

    eyes.calibrateUntil(function() {
      return !calibrating;
    });

    stdin.once("keypress", function() {
      calibrating = false;
      console.log("Done:", eyes.calibration);
      fs.writeFile(calibrationFile, JSON.stringify(eyes.calibration));
      whenComplete();
    });
  }

  // Drive the bot.  Every time a line value event comes in, figure out which
  // rule to follow from the rules mapping.  Tell the left and right wheels
  // which direction and how fast to spin.
  function drive() {
    eyes.on("line", function(err, line) {
      var rule;
      var threshold = Object.keys(drivingRules).find(function(r) {
        return line <= parseInt(r);
      });

      if (!threshold) {
        console.log("Could not find threshold for " + line);
      }

      rule = drivingRules[threshold];

      wheels.left[rule.left.dir](rule.left.speed);
      wheels.right[rule.right.dir](rule.right.speed);
    });
  }

  // Start the bot
  init();

});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
