// A directional motor example as would be used via n h-bridge controller
// such as an ardumoto shield (controls direction and uses PWM for speed)

var five = require('../lib/johnny-five.js');
var board, motor;

var PWM_LEFT = 11;
var L_MOTOR_DIR = 13;

board = new five.Board();

board.on("ready", function() {
    // simply goes forward for 5 seconds, reverse for 5 seconds then stops.

    this.pinMode(L_MOTOR_DIR, this.firmata.MODES.OUTPUT);

    motor = new five.DirectionalMotor({
        motorPin: PWM_LEFT,
        dirPin: L_MOTOR_DIR
    });

    board.repl.inject({
        motor: motor
    });

    motor.on("start", function(err, timestamp) {
        console.log("start", timestamp);
    });

    motor.on("stop", function(err, timestamp) {
        console.log("stop", timestamp);
    });

    motor.on("forward", function(err, timestamp) {
        console.log("forward", timestamp);

        board.wait(5000, function() {
            motor.reverse(50);
        });
    });

    motor.on("reverse", function(err, timestamp) {
        console.log("reverse", timestamp);

        board.wait(5000, function() {
            motor.stop();
        });
    });

    motor.forward(50);
});
