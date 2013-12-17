var five = require("../lib/johnny-five");
var board = new five.Board();
var Stepper = Stepper;

board.on('ready', function() {
  var config = {
    type: Stepper.TYPE.FOUR_WIRE,
    stepsPerRev: 200,
    pins: {
      motor1: 10,
      motor2: 11,
      motor3: 12,
      motor4: 13
    }
  };

  var stepper = new Stepper(config);

  // make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper.rpm(180).direction(Stepper.DIRECTION.CCW).accel(1600).decel(1600).step(2000, function() {
    console.log("done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper.step({
      steps: 2000,
      direction: Stepper.DIRECTION.CCW
    }, function() {
      console.log('done moving CW');
    });

  });
});
