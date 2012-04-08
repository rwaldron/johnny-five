var five = require("../lib/johnny-five.js"),
    board, repl;

board = new five.Board({
  debug: true
});

board.on("ready", function() {


  // repl = new five.Repl({
  //   board: board
  // });


  var state = 0;

  this.board.pinMode( 9, 1 );

  setInterval(function() {

    if ( state === 100 ) {
      state = 0;
    } else {
      state = 100;
    }

    // console.log( state );
    this.board.analogWrite( 9, state );

  }.bind(this), 100);
});
