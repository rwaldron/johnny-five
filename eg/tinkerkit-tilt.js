var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  // var servo = new five.Servo("O0");

  new five.Sensor("I2").on("change", function() {
    console.log(this.boolean);
  });
});
