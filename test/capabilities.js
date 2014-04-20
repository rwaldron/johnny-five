var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  Board = five.Board,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });


/*
UNO
---------------------------------------------------------
TOTAL_ANALOG_PINS       6
TOTAL_PINS              20 // 14 digital + 6 analog
VERSION_BLINK_PIN       13

IS_PIN_DIGITAL(p)       ((p) >= 2 && (p) <= 19)
IS_PIN_ANALOG(p)        ((p) >= 14 && (p) < 14 + TOTAL_ANALOG_PINS)
IS_PIN_PWM(p)           digitalPinHasPWM(p)
IS_PIN_SERVO(p)         (IS_PIN_DIGITAL(p) && (p) - 2 < MAX_SERVOS)
IS_PIN_I2C(p)           ((p) == 18 || (p) == 19)

PIN_TO_ANALOG(p)        ((p) - 14)
---------------------------------------------------------


MEGA
---------------------------------------------------------
TOTAL_ANALOG_PINS       16
TOTAL_PINS              70 // 54 digital + 16 analog
VERSION_BLINK_PIN       13

IS_PIN_DIGITAL(p)       ((p) >= 2 && (p) < TOTAL_PINS)
IS_PIN_ANALOG(p)        ((p) >= 54 && (p) < TOTAL_PINS)
IS_PIN_PWM(p)           digitalPinHasPWM(p)
IS_PIN_SERVO(p)         ((p) >= 2 && (p) - 2 < MAX_SERVOS)
IS_PIN_I2C(p)           ((p) == 20 || (p) == 21)

PIN_TO_ANALOG(p)        ((p) - 54)
---------------------------------------------------------

*/


exports["UNO Pin Capabilities"] = {

  isDigital: function(test) {
    test.expect(7);

    // RX/TX: false
    test.ok(!board.pins.isDigital(0));
    test.ok(!board.pins.isDigital(1));

    //  In Range: true
    test.ok(board.pins.isDigital(2));
    test.ok(board.pins.isDigital(13));
    test.ok(board.pins.isDigital(19));

    // Out of Range: false
    test.ok(!board.pins.isDigital(30));
    test.ok(!board.pins.isDigital(-1));

    test.done();
  },

  isAnalog: function(test) {
    test.expect(7);

    // RX/TX: false
    test.ok(!board.pins.isAnalog(0));
    test.ok(!board.pins.isAnalog(1));

    //  In Range: true
    test.ok(board.pins.isAnalog(14));
    test.ok(board.pins.isAnalog(15));
    test.ok(board.pins.isAnalog(19));

    // Out of Range: false
    test.ok(!board.pins.isAnalog(30));
    test.ok(!board.pins.isAnalog(-1));

    test.done();
  },

  isPWM: function(test) {
    test.expect(7);

    // RX/TX: false
    test.ok(!board.pins.isPwm(0));
    test.ok(!board.pins.isPwm(1));

    //  In Range: true
    test.ok(board.pins.isPwm(9));
    test.ok(board.pins.isPwm(10));
    test.ok(board.pins.isPwm(11));

    // Out of Range: false
    test.ok(!board.pins.isPwm(30));
    test.ok(!board.pins.isPwm(-1));

    test.done();
  },

  isServo: function(test) {
    test.expect(7);

    // RX/TX: false
    test.ok(!board.pins.isServo(0));
    test.ok(!board.pins.isServo(1));

    //  In Range: true
    test.ok(board.pins.isServo(9));
    test.ok(board.pins.isServo(10));
    test.ok(board.pins.isServo(11));

    // Out of Range: false
    test.ok(!board.pins.isServo(30));
    test.ok(!board.pins.isServo(-1));

    test.done();
  },

  isInput: function(test) {
    test.expect(6);

    // RX/TX: false
    test.ok(!board.pins.isInput(0));
    test.ok(!board.pins.isInput(1));

    //  In Range: true
    test.ok(board.pins.isInput(14));
    test.ok(board.pins.isInput(9));

    // Out of Range: false
    test.ok(!board.pins.isInput(30));
    test.ok(!board.pins.isInput(-1));

    test.done();
  },

  isOutput: function(test) {
    test.expect(6);

    // RX/TX: false
    test.ok(!board.pins.isOutput(0));
    test.ok(!board.pins.isOutput(1));

    //  In Range: true
    test.ok(board.pins.isOutput(14));
    test.ok(board.pins.isOutput(9));

    // Out of Range: false
    test.ok(!board.pins.isOutput(30));
    test.ok(!board.pins.isOutput(-1));

    test.done();
  },

  translate: function(test) {
    test.expect(6);

    test.equal(five.Board.Pins.translate("I0", "UNO"), "A0");
    test.equal(five.Board.Pins.translate("I0", "uno"), "A0");
    test.equal(five.Board.Pins.translate("I0", "?"), "I0");

    test.equal(five.Board.Pins.translate(14, "UNO"), "A0");
    test.equal(five.Board.Pins.translate(54, "MEGA"), "A0");
    test.equal(five.Board.Pins.translate(14, "LEONARDO"), "A0");

    test.done();
  }
};
