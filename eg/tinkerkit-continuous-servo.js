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
// - [TinkerKit Servo](http://tinkerkit.tihhs.nl/servo/)
// - [TinkerKit Linear Potentiometer](http://tinkerkit.tihhs.nl/linear-pot/)
// - [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)
// @markdown
