var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  var rotary = new five.Sensor("A0");

  // Plug the Servo module
  // into the Grove Shield's D5 jack
  var servo = new five.Servo(5);

  // Set scaling of the Rotary angle
  // sensor's output to 0-180° (8-bit)
  // range. Set the servo angle in
  // degrees corresponding to the
  // value of the sensor
  rotary.scale(0, 180).on("change", function() {
    servo.to(this.value);
  });
});

/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - Servo Module](http://www.seeedstudio.com/depot/images/product/GroveServo_01.jpg)

![Grove - Rotary Angle Sensor](http://www.seeedstudio.com/depot/images/product/GroveRotaryP.jpg)

@markdown */
