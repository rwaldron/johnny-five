// A  motor example as would be used via n h-bridge controller
// such as an ardumoto shield (controls direction and uses PWM for speed)

var five = require('../lib/johnny-five.js');
var board, motor;

var PWM_LEFT = 3;
var L_MOTOR_DIR = 12;

board = new five.Board();

board.on("ready", function() {
    // simply goes forward for 5 seconds, reverse for 5 seconds then stops.

    motor = new five.Motor({
        pins: {
            motor: PWM_LEFT,
            dir: L_MOTOR_DIR
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

    motor.on("forward", function(err, timestamp) {
        console.log("forward", timestamp);

        // demonstrate switching to reverse after 5 seconds
        board.wait(5000, function() {
            motor.reverse(50);
        });
    });

    motor.on("reverse", function(err, timestamp) {
        console.log("reverse", timestamp);

        // demonstrate stopping after 5 seconds
        board.wait(5000, function() {
            motor.stop();
        });
    });

    // set the motor going forward at speed 50
    motor.forward(50);
});
