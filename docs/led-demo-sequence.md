<!--remove-start-->

# LED - Demo sequence

<!--remove-end-->


Demonstrates stringing some of the LED commands together to demonstrate LED capabilities. Requires LED on pin that supports PWM (usually denoted by ~).





##### LED on pin 11 (Arduino UNO)


LED inserted directly into pin 11.


![docs/breadboard/led-11-pwm.png](breadboard/led-11-pwm.png)<br>

Fritzing diagram: [docs/breadboard/led-11-pwm.fzz](breadboard/led-11-pwm.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-demo-sequence.js
```


```javascript
const { Board, Led } = require("johnny-five");
const board = new Board();
let led;

// Do we want the sequence to loop?
const loop = true;

// Create a simple demo sequece that calls various
// five.Led methods with specified arguments and
// let it run for the given duration (defaults to 3 seconds).
const demoSequence = [{
  method: "pulse",
  args: [1000],
  duration: 5000
}, {
  method: "strobe",
  args: [500],
  duration: 3000
}, {
  method: "fadeIn",
  args: [
    2000,
    () => {
      console.log("fadeIn complete!");
    }
  ],
  duration: 2500
}, {
  method: "fadeOut",
  args: [
    5000,
    () => {
      console.log("fadeOut complete!");
    }
  ],
  duration: 5500
}, {
  method: "brightness",
  args: [10],
  duration: 3000
}, {
  method: "off"
}];


// Execute a method in the demo sequence
function execute(step) {

  // Grab everything we need for this step
  const method = demoSequence[step].method;
  const args = demoSequence[step].args;
  const duration = demoSequence[step].duration || 3000;

  // Just print out what we're executing
  console.log("led." + method + "(" + (args ? args.join() : "") + ")");

  // Make the actual call to the LED
  Led.prototype[method].apply(led, args);

  // Increment the step
  step++;

  // If we're at the end, start over (loop==true) or exit
  if (step === demoSequence.length) {
    if (loop) {
      step = 0;
    } else {
      // We're done!
      process.exit(0);
    }
  }

  // Recursively call the next step after specified duration
  board.wait(duration, () => {
    execute(step);
  });
}

board.on("ready", () => {
  // Defaults to pin 11 (must be PWM)
  led = new Led(process.argv[2] || 11);

  // Kick off the first step
  execute(0);
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
