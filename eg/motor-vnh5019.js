var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  
  // You can configure with explicit pins settings
  var m1 = new five.Motor({
    pins: {
      pwm: 9,
      dir: 2,
      cdir: 4,
      enable: 6
    }
  });

  // Or you can configure using the built in configs
  var m2 = new five.Motor(five.Motor.SHIELD_CONFIGS.POLOLU_VNH5019_SHIELD.M2);

  // Inject the `motor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    m1: m1,
    m2: m2
  });

  // "start" events fire when the motor is started.
  [m1, m2].forEach( (motor, index) => {
    motor.on("start", () => {
      console.log("start motor " + (index+1));

      // Demonstrate motor stop in 2 seconds
      this.wait(2000, function() {
        motor.stop();
      });
    });
  });

  [m1, m2].forEach( (motor, index) => {
    
    // "stop" events fire when the motor is stopped.
    motor.on("stop", function() {
      console.log("stop");
    });
  });

  // Motor API

  // start([speed)
  // Start the motor. `isOn` property set to |true|
  // Takes an optional parameter `speed` [0-255]
  // to define the motor speed if a PWM Pin is
  // used to connect the motor.
  m1.start();
  m2.start();

  // stop()
  // Stop the motor. `isOn` property set to |false|
});
