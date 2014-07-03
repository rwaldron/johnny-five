var five = require("../lib/johnny-five");
var temporal = require("temporal");
var board = new five.Board();


board.on("ready", function() {

  var lc = new five.LedControl({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    },
    isMatrix: true
  });

  lc.on();

  var fns = [
    function() {
      for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {
          lc.led(0, x, y, 1);
        }
      }
    },
    function() {
      for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {
          lc.led(0, x, y, 0);
        }
      }
    },
    function() {
      for (var x = 0; x < 8; x++) {
        lc.row(0, x, 255);
      }
    },
    function() {
      for (var x = 0; x < 8; x++) {
        lc.row(0, x, 0);
      }
    },
    function() {
      for (var y = 0; y < 8; y++) {
        lc.column(0, y, 255);
      }
    },
    function() {
      for (var y = 0; y < 8; y++) {
        lc.column(0, y, 0);
      }
      demo();
    }
  ];

  function demo() {
    temporal.queue(fns.map(function(fn) {
      return { delay: 2000, task: fn };
    }));
  }

  demo();
});
