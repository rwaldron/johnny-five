var LedControl = require('../lib/led-control');

var five = require("../lib/johnny-five"),
    board, lc;

board = new five.Board();

board.on('ready', function() {
  var led = new five.Led(13);
  led.on();

  lc = new LedControl({
    data: 2,
    clock: 3,
    cs: 4,
    devices: 1
  });

  lc.on( 0 );

  board.repl.inject({
    lc: lc
  });
});