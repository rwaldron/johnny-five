var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  // var servo = new five.Servo("O0");

  new five.Sensor("I2").on("change", function() {
    console.log(this.boolean);
  });
});

// @markdown
// - [TinkerKit Servo](http://tinkerkit.tihhs.nl/servo/)
// - [TinkerKit Linear Potentiometer](http://tinkerkit.tihhs.nl/linear-pot/)
// - [TinkerKit Shield](http://tinkerkit.tihhs.nl/shield/)
// @markdown
