var five = require("../lib/johnny-five.js");

// Create 2 board instances with IDs "A" & "B"
new five.Boards([ "A", "B" ]).on("ready", function() {

  // |this| is an array-like object containing references
  // to each initialized board.
  this.each(function(board) {

    // Initialize an Led instance on pin 13 of
    // each initialized board and strobe it.
    new five.Led({ pin: 13, board: board }).strobe();
  });
});
