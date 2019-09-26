"use strict";

global.IS_TEST_MODE = true;

// Built-ins
global.Emitter = require("events");

// Internal
global.Collection = require("../../lib/mixins/collection");
global.Withinable = require("../../lib/mixins/within");
global.five = require("../../lib/johnny-five");
global.EVS = require("../../lib/evshield");


// Third Party (library)
global.converter = require("color-convert");
global.SerialPort = require("serialport");
global.Firmata = require("firmata");
global.temporal = require("temporal");

// Third Party (test)
global.mocks = require("mock-firmata");
global.sinon = require("sinon");


global.MockFirmata = mocks.Firmata;
global.MockSerialPort = mocks.SerialPort;

global.Accelerometer = five.Accelerometer;
global.Animation = five.Animation;
global.Altimeter = five.Altimeter;
global.Barometer = five.Barometer;
global.Board = five.Board;
global.Boards = five.Boards;
global.Button = five.Button;
global.Buttons = five.Buttons;
global.Color = five.Color;
global.Compass = five.Compass;
global.ESC = five.ESC;
global.ESCs = five.ESCs;
global.Expander = five.Expander;
global.Fn = five.Fn;
global.GPS = five.GPS;
global.Gyro = five.Gyro;
global.Hygrometer = five.Hygrometer;
global.IMU = five.IMU;
global.Multi = five.Multi;
global.SIP = five.SIP;
global.Keypad = five.Keypad;
global.LCD = five.LCD;
global.Led = five.Led;
global.Leds = five.Leds;
global.LedControl = five.LedControl;
global.Light = five.Light;
global.Joystick = five.Joystick;
global.Motion = five.Motion;
global.Motor = five.Motor;
global.Motors = five.Motors;
global.Orientation = five.Orientation;
global.Piezo = five.Piezo;
global.Pin = five.Pin;
global.Proximity = five.Proximity;
global.ReflectanceArray = five.ReflectanceArray;
global.Relay = five.Relay;
global.RGB = five.Led.RGB;
global.RGBs = five.Led.RGB.Collection;
global.Repl = five.Repl;
global.Sensor = five.Sensor;
global.Serial = five.Board.Serial;
global.Servo = five.Servo;
global.Servos = five.Servos;
global.ShiftRegister = five.ShiftRegister;
global.Stepper = five.Stepper;
global.Switch = five.Switch;
global.Thermometer = five.Thermometer;
global.Virtual = five.Board.Virtual;

// Used for alias tests
global.Analog = five.Sensor.Analog;
global.Digital = five.Sensor.Digital;
global.Luxmeter = five.Luxmeter;
global.Magnetometer = five.Magnetometer;


function newBoard(pins) {

  if (pins) {
    pins.forEach(pin => {
      Object.assign(pin, {
        mode: 1,
        value: 0,
        report: 1,
        analogChannel: 127
      });
    });
  }

  const io = new MockFirmata({ pins });
  const debug = false;
  const repl = false;

  io.SERIAL_PORT_IDs.DEFAULT = 0x08;

  const board = new Board({ debug, io, repl });

  io.emit("connect");
  io.emit("ready");

  return board;
}

global.newBoard = newBoard;


const digits = {
  all(x) {
    return String(x).replace(/\./g, "").length;
  },
  integral(x) {
    return String(x).split(".")[0].length;
  },
  fractional(x) {
    let parts = String(x).split(".");
    return parts.length < 2 ? 0 : parts[1].length;
  },
};

global.digits = digits;


global.addControllerTest = (Constructor, Controller, options) => ({
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    const board = newBoard();
    this.Controller = this.sandbox.spy(Board, "Controller");
    this.component = new Constructor(Object.assign({}, options, { board }));
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  controller(test) {
    // test.expect(2);
    // Board.Controller may called more than once, for example: Servo -> Expander
    test.equal(this.Controller.called, true);
    // We can only test for the FIRST call to Board.Controller, since
    // we can't generically know which componant class controllers will
    // instantiate an Expander
    test.notEqual(this.Controller.firstCall.args[0], null);
    test.notEqual(this.Controller.firstCall.args[0], undefined);
    test.notEqual(typeof this.Controller.firstCall.args[0], "string");
    test.done();
  }
});

global.CardinalPointsToIndex = require("./cardinal-points.json");
