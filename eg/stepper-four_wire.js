var five = require("../lib/johnny-five");

var board = new five.Board();

board.on('ready', function() {
  var stepperConfig = {
    type: board.firmata.STEPPER.TYPE.FOUR_WIRE,
    stepsPerRev: 200,
    pins: {
      motor1: 10,
      motor2: 11,
      motor3: 12,
      motor4: 13
    }
  };

  var stepper = new five.Stepper(stepperConfig);

  // make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper.rpm(180).direction(board.firmata.STEPPER.DIRECTION.CCW).accel(1600).decel(1600).step(2000, function() {
    console.log("done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper.step({ steps:2000, direction: board.firmata.STEPPER.DIRECTION.CCW }, function() {
      console.log('done moving CW');
    });

  });
});
