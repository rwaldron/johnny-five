var five = require("../lib/johnny-five.js"),
    board, button, repl;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  button = new five.Button({
    board: board
  });

  repl = new five.Repl({
    board: board,
    button: button
  });

  // down? press?

  button.on("up", function() {
    console.log("up");
  });

  button.on("down", function() {
    console.log("down");
  });
});
