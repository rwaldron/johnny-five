var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  var motor;
  /*
    Seeed Studio Motor Shield V1.0, V2.0
      Motor A
        pwm: 9
        dir: 8
        cdir: 11
        
      Motor B
        pwm: 10
        dir: 12
        cdir: 13

    Freetronics Motor Shield
      Motor A
        pwm: 6
        dir: 5
        cdir: 7
        
      Motor B
        pwm: 4
        dir: 3
        cdir: 2

   */


  motor = new five.Motor({
    pins: {
      pwm: 9,
      dir: 8,
      cdir: 11
    }
  });




  board.repl.inject({
    motor: motor
  });

  motor.on("start", function(err, timestamp) {
    console.log("start", timestamp);
  });

  motor.on("stop", function(err, timestamp) {
    console.log("automated stop on timer", timestamp);
  });

  motor.on("brake", function(err, timestamp) {
    console.log("automated brake on timer", timestamp);
  });

  motor.on("forward", function(err, timestamp) {
    console.log("forward", timestamp);

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, function() {
      motor.reverse(255);
    });
  });

  motor.on("reverse", function(err, timestamp) {
    console.log("reverse", timestamp);

    // demonstrate braking after 5 seconds
    board.wait(5000, function() {

      // Brake for 500ms and call stop()
      motor.brake(500);
    });
  });

  // set the motor going forward full speed
  motor.forward(255);
});
