var five = require("../lib/johnny-five.js"),
    board, ir;

board = new five.Board();
board.on("ready", function() {

  ir = {
    reference: new five.Led(13),
    transmit: new five.Led(9),
    receive: new five.Sensor({
      pin: 8,
      freq: 10
    })
  };

  ir.receive.scale([ 0, 100 ]).on("read", function() {

    // console.log( this.value );

  });

  ir.reference.on();

  ir.transmit.strobe(1);


  this.repl.inject({
    t: ir.transmit
  });
});
