var five = require("../lib/johnny-five.js"),
    board, button;

board = new five.Board();

board.on("ready", function() {

  // Create a new `button` hardware instance
  button = new five.Button({
    board: board,
    pin: 7,
    holdtime: 1000,
    invert: false // Default: "false".  Set to "true" if button is Active-Low
  });

  // Inject the `button` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    button: button
  });

  // Button Event API

  // "down" the button is pressed
  button.on("down", function() {
    console.log("down");
  });

  // "hold" the button is pressed for specified time.
  //        defaults to 500ms (1/2 second)
  //        set
  button.on("hold", function() {
    console.log("hold");
  });

  // "up" the button is released
  button.on("up", function() {
    console.log("up");
  });
});
