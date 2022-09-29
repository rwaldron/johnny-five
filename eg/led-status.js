//
// Simple demonstration of Led.value, Led.mode,
// Led.isOn, and Led.isRunning following a variety
// of Led method calls.
//
const { Board, Led } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // Default to pin 11 (must be PWM)
  const led = new Led(process.argv[2] || 11);

  board.repl.inject({ led });

  // Print defaut status
  console.log("default status");
  status();

  // Turn LED on and print status
  console.log("led.on()");
  led.on();
  status();

  // Start blink and print status
  console.log("led.blink()");
  led.blink();
  status();
  led.stop();

  // Set brightness and print status
  console.log("led.brightness(25)");
  led.brightness(25);
  status();

  // Start pulse and print status
  console.log("led.pulse(500)");
  led.pulse(500);
  status();

  // Wait 3 seconds, stop, and print status
  board.wait(3000, () => {
    console.log("led.stop()");
    led.stop();
    // Note that value/isOn will reflect the state of
    // the pulse when stop() was called.
    status();
  });

  function status() {
    console.log("led.value = %d", led.value); // print analog brightness of LED
    console.log("led.mode = %d", led.mode); // print the pin mode (1 is OUTPUT, 3 is PWM)
    console.log("led.isOn = %s", led.isOn); // print if the LED is on
    console.log("led.isRunning = %s", led.isRunning); // print if animation currently running
    console.log("");
  }
});
