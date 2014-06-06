var five = require("../lib/johnny-five.js"),
  temporal = require("temporal"),
  board = new five.Board();

// Default to pin 11 (PWM)
board.on("ready", function() {

  // Defaults to pin 11 (must be PWM)
  var led = new five.Led(process.argv[2] || 11);

  this.repl.inject({
    led: led
  });

  temporal.queue([{
    delay: 0,
    task: function() {
      // on()
      //
      // Turns the led on
      led.on();
      console.log("led on");
    }
  }, {
    delay: 2000,
    task: function() {
      // off()
      //
      // Turns the led off
      led.off();
      console.log("led off");
    }
  }, {
    delay: 1000,
    task: function() {
      // pulse( rate )
      //
      // Pulse the led (fade on/off)
      // pinMode will be changed to PWM automatically
      led.pulse( 2000 );
      console.log("led pulse");
    }
  }, {
    delay: 6000,
    task: function() {
      // strobe( rate )
      //
      // Strobe the led (on/off)
      led.strobe(500);
      console.log("led strobe");
    }
  }, {
    delay: 5000,
    task: function() {
      // stop()
      //
      // Stop the pulse
      led.stop();
      console.log("led stop");

      // If you want to make sure it's off
      // in case it stopped it while on
      led.off();
    }
  }, {
    delay: 500,
    task: function() {
      // fadeIn()
      //
      // Fade in the led
      // pinMode will be changed to PWM automatically
      led.fadeIn(3000);
      console.log("led fadeIn");
    }
  }, {
    delay: 5000,
    task: function() {
      // fadeOut()
      //
      // Fade out the led
      // pinMode will be changed to PWM automatically
      led.fadeOut(3000);
      console.log("led fadeOut");
    }
  }, {
    delay: 5000,
    task: function() {
      // brightness ()
      //
      // set analog brightness (0-255)
      led.brightness(5);
      console.log("led brightness");
    }
  }]);


});

// @markdown
// To make use of `Led` methods like `fade`, `pulse`, `animate`,
// you'll need to wire an LED to a PWM pin.
// If you use a different pin, make sure to run the script with the correct pin number:
//
// `node eg/led.js [pinNumber]`
// @markdown
