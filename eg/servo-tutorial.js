var five = require("../lib/johnny-five.js"),
    board, servo;

board = new five.Board();

board.on("ready", function() {

  five.Servo({
    pin: 9,
    // Limit this servo to 170°
    range: [ 45, 135 ]
  });

  five.Servo(10);


  servo = new five.Servos();

  // You can add any objects to the board's REPL,
  // Let's add the servo here, so we can control
  // it directly from the REPL!
  board.repl.inject({
    servo: servo
  });
  //
  //
  servo.max();
});
