var five = require("../lib/johnny-five.js"),
  board, slider;

board = new five.Board();

board.on("ready", function() {

  // Create a new `slider` hardware instance.
  slider = new five.Sensor("A0");

  // Inject the `slider` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    slider: slider
  });

  //
  // "change", "slide", "touch", "bend"
  //
  // Fires when value of sensor changes
  //
  slider.scale([0, 100]).on("slide", function() {

    console.log("slide", this.value);

  });
});

// Tutorials
//
// http://www.dfrobot.com/wiki/index.php?title=Analog_Slide_Position_Sensor_(SKU:_DFR0053)
