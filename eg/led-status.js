//
// Simple demonstration of Led.value, Led.mode,
// Led.isOn, and Led.isRunning following a variety
// of Led method calls.
//
var five = require("../lib/johnny-five.js"),
  board = new five.Board(),
  led;

board.on("ready", function() {
  // Default to pin 11 (must be PWM)
  led = new five.Led(process.argv[2] || 11);

  this.repl.inject({
    led: led
  });

  // Print defaut status
  console.log("default status");
  printStatus();

  // Turn LED on and print status
  console.log("led.on()");
  led.on();
  printStatus();

  // Start blink and print status
  console.log("led.blink()");
  led.blink();
  printStatus();
  led.stop();

  // Set brightness and print status
  console.log("led.brightness(25)");
  led.brightness(25);
  printStatus();

  // Start pulse and print status
  console.log("led.pulse(500)");
  led.pulse(500);
  printStatus();

  // Wait 3 seconds, stop, and print status
  this.wait(3000, function() {
    console.log("led.stop()");
    led.stop();
    // Note that value/isOn will reflect the state of
    // the pulse when stop() was called.
    printStatus();
  });

});

function printStatus() {
  console.log("led.value = %d", led.value); // print analog brightness of LED
  console.log("led.mode = %d", led.mode); // print the pin mode (1 is OUTPUT, 3 is PWM)
  console.log("led.isOn = %s", led.isOn); // print if the LED is on
  console.log("led.isRunning = %s", led.isRunning); // print if animation currently running
  console.log("");
}
