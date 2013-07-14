var five = require("../lib/johnny-five");

var board = new five.Board();

board.on("ready", function() {

  // var stepper = new five.Stepper({
  //   type: five.Stepper.TYPE.DRIVER,
  //   stepsPerRev: 200,
  //   pins: {
  //     step: 11,
  //     dir: 12
  //   }
  // });


  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: [ 11, 12 ]
  });

  // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper.rpm(180).ccw().accel(1600).decel(1600).step(2000, function() {

    console.log("Done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper.step({ steps: 2000, direction: five.Stepper.DIRECTION.CW }, function() {
      console.log("Done moving CW");
    });
  });
});
