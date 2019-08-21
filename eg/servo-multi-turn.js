const {Board, Servo} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const servo = new Servo({
    pin: 10,
    // Cheapo servo has limited PWM range
    pwmRange: [600, 2370],
    // This multi-turn servo can turn 2430 degrees or 6.75 revolutions
    deviceRange: [0, 2430]
  });

  // Add servo to REPL (optional)
  board.repl.inject({
    servo
  });


  // Servo API

  // min()
  //
  // move the servo to its minimum position
  //
  // eg. servo.min();

  // max()
  //
  // move the servo to its maximum position of 6.75 turns from the minimum
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo at 3 3/8 turns from the minimum
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to 2 whole turns from the minimum
  //
  // servo.to( 720 );

});
