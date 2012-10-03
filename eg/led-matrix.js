var five = require("../lib/johnny-five"),
    board, lc;

board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);
  led.on();

  var heart = [
    "01100110",
    "10011001",
    "10000001",
    "10000001",
    "01000010",
    "00100100",
    "00011000",
    "00000000"
  ];

  lc = new five.LedControl({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    },
    devices: 1,
    isMatrix: true
  });

  function queue(fn) {
    process.nextTick( fn );
  }

  lc.heart = function() {
    heart.forEach(function(row, rowIndex) {
      queue( function() { lc.row( 0, rowIndex, parseInt( row, 2 ) ); } );
    });
  };

  lc.on( 0 );

  var msg = "johnny-five";
  var idx = 0;

  function next() {
    var c = msg[ idx ];
    lc.char( 0, c );
    idx++;
    if ( idx === msg.length ) { return; }
    setTimeout( next, 800 );
  }

  next();

  board.repl.inject({
    lc: lc
  });

});
