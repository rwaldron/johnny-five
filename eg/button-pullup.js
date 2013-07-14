// The `isPullup` button option enables the pullup 
// resistor on the pin and automatically sets the
// `invert` option to true

// In this circuit configuration, the LED would always
// be on without the pullup resistor enabled

// For more info on pullup resistors, see:
// http://arduino.cc/en/Tutorial/InputPullupSerial
// http://arduino.cc/en/Tutorial/DigitalPins
// https://learn.sparkfun.com/tutorials/pull-up-resistors

var five = require( 'johnny-five' ),
    button, led;

five.Board().on( 'ready', function() {

  // Create a new `button` hardware instance.
  // pinMode is set to INPUT by default
  button = new five.Button({
    pin: 2,
    isPullup: true
  });

  // Create a standard `led` hardware instance
  // pinMode is set to OUTPUT by default
  led = new five.Led(13);

  // The implicit `invert: true` turns makes this
  // seem normal. Setting `invert: false` will
  // Turn the LED off when the button is pressed and
  // on when it is released.
  button.on('down', function(value){
    led.on();
  });

  button.on('up', function(){
    led.off();
  });

});