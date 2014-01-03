var five = require("../lib/johnny-five.js"),
  temporal = require("temporal"),
  board = new five.Board();

board.on("ready", function() {
  var events, strobe, analog;

  events = [];
  strobe = new five.Pin({
    addr: 13
  });

  temporal.loop(500, function(loop) {
    strobe[loop.called % 2 === 0 ? "high" : "low"]();
  });


  // Event tests
  ["high", "low"].forEach(function(state) {
    strobe.on(state, function() {
      if (events.indexOf(state) === -1) {
        console.log("Event emitted for:", state, "on", this.addr);
        events.push(state);
      }
    });
  });

  analog = new five.Pin("A0");

  analog.query(function(state) {
    console.log(state);
  });
});
