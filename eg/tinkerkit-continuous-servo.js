var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  var servo = new five.Servo({
    pin: "O0",
    type: "continuous"
  });

  new five.Sensor("I0").scale(0, 1).on("change", function() {
    servo.cw(this.value);
  });
});

// @markdown
// - [TinkerKit Servo](http://www.tinkerkit.com/servo/)
// - [TinkerKit Linear Potentiometer](http://www.tinkerkit.com/linear-pot/)
// - [TinkerKit Shield](http://www.tinkerkit.com/shield/)
// @markdown
