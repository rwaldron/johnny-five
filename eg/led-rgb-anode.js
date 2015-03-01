var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var anode = new five.Led.RGB({
    pins: {
      red: 3,
      green: 5,
      blue: 6
    },
    isAnode: true
  });

  anode.strobe();

  this.repl.inject({
    anode: anode
  });

});
