// The `isPullup` button option enables the pullup
// resistor on the pin and automatically sets the
// `invert` option to true

// In this circuit configuration, the LED would always
// be on without the pullup resistor enabled

// For more info on pullup resistors, see:
// http://arduino.cc/en/Tutorial/InputPullupSerial
// http://arduino.cc/en/Tutorial/DigitalPins
// https://learn.sparkfun.com/tutorials/pull-up-resistors

var five = require("../lib/johnny-five"),
  button, led;

five.Board().on("ready", function() {

  button = new five.Button({
    pin: 2,
    isPullup: true
  });

  led = new five.Led(13);

  button.on("down", function(value) {
    led.on();
  });

  button.on("up", function() {
    led.off();
  });

});
