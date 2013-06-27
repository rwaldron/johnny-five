var Board = require("../lib/board.js");

var priv = new WeakMap(),
    steppers = [],
    stepperIdMap = {};

var MAXSTEPPERS = 6; // correlates with MAXSTEPPERS in firmware

/**
 * Stepper - Class for handling steppers attached through a 2-pin controllable stepper driver (Pololu, Stepstick, etc)
 * @constructor
 *
 * Needs the pin that is used as the step pin, the direction pin, and number of steps per revolution
 *
 * five.Stepper({
 *   pin: number,
 *   dir: number,
 *   steps: number
 *  });
 *
 *
 * @param {Object} opts
 *
 */

function Stepper( opts ) {

    if ( !(this instanceof Stepper) ) {
        return new Stepper( opts );
    }

    this.steps = opts.steps;
    this.dir = opts.dir;

    // Initialize a Device instance on a Board
    Board.Device.call(
        this, opts = Board.Options( opts )
    );

    var newId = -1;

    for (var i = 0; i < MAXSTEPPERS; i++) {
        if (!stepperIdMap.hasOwnProperty(i)) {
            stepperIdMap[i] = this;
            newId = i;
            break;
        }
    }

    // unable to setup more than MAXSTEPPERS
    if (newId === -1) {
        throw new Error("Unable to setup more than " + MAXSTEPPERS + "stepper motors");
    }

    steppers.push(this);

    this.firmata.stepperSetup(newId, this.steps, this.dir, this.pin);
    priv.set(this, {
        stepperId: newId
    });


};


Stepper.prototype.setSpeed = function(rpm) {
    this.firmata.stepperSpeed(priv.get(this).stepperId, rpm);
};

Stepper.prototype.step = function(numberOfSteps) {
    this.firmata.stepperStep(priv.get(this).stepperId, numberOfSteps);
};



module.exports = Stepper;
