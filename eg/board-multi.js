var five = require("../lib/johnny-five.js");

new five.Boards([ "a", "b" ]).on("ready", function(boards) {
  this.each(function(board) {
    new five.Led({ pin: 13, board: board }).strobe();
  });
});
