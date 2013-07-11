var five = require('../lib/johnny-five.js');
var board, motor;

var PWM_LEFT = 11;
var PWM_RIGHT = 3;
var L_MOTOR_DIR = 13;
var R_MOTOR_DIR = 12;

console.log("Connecting to robot");

board = new five.Board();

board.on("ready", function() {
    "use strict"

    console.log("Connected to bot. Time for tests");

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
            // reverse now
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
