var Emitter = require("events").EventEmitter;
var shared;

function Bank(options) {
  this.address = options.address;
  this.io = options.io;
  this.io.i2cConfig();
}

Bank.prototype.read = function(register, numBytes, callback) {
  this.io.i2cRead(this.address, register, numBytes, callback);
};

Bank.prototype.write = function(register, bytes) {
  if (!Array.isArray(bytes)) {
    bytes = [bytes];
  }
  this.io.i2cWrite(this.address, register, bytes);
};

// http://www.nr.edu/csc200/labs-ev3/ev3-user-guide-EN.pdf

function EV3(options) {
  if (shared) {
    return shared;
  }

  this.bank = {
    a: new Bank({
      address: EV3.BANK_A,
      io: options.io,
    }),
    b: new Bank({
      address: EV3.BANK_B,
      io: options.io,
    })
  };

  shared = this;
}

EV3.shieldPort = function(pin) {
  var port = EV3[pin];

  if (port === undefined) {
    throw new Error("Invalid EV3 pin name");
  }

  var address, bank, motor, mode, offset, sensor;
  var endsWithS1 = false;

  if (pin.startsWith("BA")) {
    address = EV3.BANK_A;
    bank = "a";
  } else {
    address = EV3.BANK_B;
    bank = "b";
  }

  if (pin.includes("M")) {
    motor = pin.endsWith("M1") ? EV3.S1 : EV3.S2;
  }

  if (pin.includes("S")) {
    endsWithS1 = pin.endsWith("S1");

    mode = endsWithS1 ? EV3.S1_MODE : EV3.S2_MODE;
    // Used for read registers
    offset = endsWithS1 ? EV3.S1_OFFSET : EV3.S2_OFFSET;
    // Used to address "sensor type"
    sensor = endsWithS1 ? EV3.S1 : EV3.S2;
  }

  return {
    address: address,
    bank: bank,
    mode: mode,
    motor: motor,
    offset: offset,
    port: port,
    sensor: sensor,
  };
};

EV3.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: EV3
  }
});

EV3.prototype.setup = function(port, type) {
  this.bank[port.bank].write(port.mode, [type]);
};

EV3.prototype.read = function(port, register, numBytes, callback) {

  if (port.sensor && port.offset) {
    register += port.offset;
  }

  this.bank[port.bank].read(register, numBytes, callback);
};

EV3.prototype.write = function(port, register, data) {
  this.bank[port.bank].write(register, data);
};

/*
 * Shield Registers
 */

EV3.BAS1 = 0x01;
EV3.BAS2 = 0x02;
EV3.BBS1 = 0x03;
EV3.BBS2 = 0x04;

EV3.BAM1 = 0x05;
EV3.BAM2 = 0x06;
EV3.BBM1 = 0x07;
EV3.BBM2 = 0x08;

EV3.BANK_A = 0x1A;
EV3.BANK_B = 0x1B;

EV3.S1 = 0x01;
EV3.S2 = 0x02;

EV3.M1 = 0x01;
EV3.M2 = 0x02;
EV3.MM = 0x03;

EV3.Type_NONE = 0x00;
EV3.Type_SWITCH = 0x01;
EV3.Type_ANALOG = 0x02;

EV3.Type_LIGHT_REFLECTED = 0x03;
EV3.Type_LIGHT_AMBIENT = 0x04;
EV3.Type_I2C = 0x09;

EV3.Type_COLORFULL = 0x0D;
EV3.Type_COLORRED = 0x0E;
EV3.Type_COLORGREEN = 0x0F;
EV3.Type_COLORBLUE = 0x10;
EV3.Type_COLORNONE = 0x11;
EV3.Type_EV3_TOUCH = 0x12;
EV3.Type_EV3 = 0x13;

/*
 * Sensor Port Controls
 */
EV3.S1_MODE = 0x6F;
// EV3.S1_EV3_MODE = 0x6F;
EV3.S1_ANALOG = 0x70;
EV3.S1_OFFSET = 0;

EV3.S2_MODE = 0xA3;
// EV3.S2_EV3_MODE = 0x6F;
EV3.S2_ANALOG = 0xA4;
EV3.S2_OFFSET = 52;

/*
 * Sensor Read Registers
 */
EV3.Bump = 0x84;
EV3.Proximity = 0x83;
EV3.Touch = 0x83;




/*
 * Sensor Read Byte Counts
 */
EV3.Bump_Bytes = 1;
EV3.Proximity_Bytes = 2;
EV3.Touch_Bytes = 1;


/*
 * Motor selection
 */
EV3.Motor_1 = 0x01;
EV3.Motor_2 = 0x02;
EV3.Motor_Both = 0x03;

/*
 * Motor next action
 */
// stop and let the motor coast.
EV3.Motor_Next_Action_Float = 0x00;
// apply brakes, and resist change to tachometer, but if tach position is forcibly changed, do not restore position
EV3.Motor_Next_Action_Brake = 0x01;
// apply brakes, and restore externally forced change to tachometer
EV3.Motor_Next_Action_BrakeHold = 0x02;

EV3.Motor_Stop = 0x60;
EV3.Motor_Reset = 0x52;

/*
 * Motor direction
 */

EV3.Motor_Reverse = 0x00;
EV3.Motor_Forward = 0x01;

/*
 * Motor Tachometer movement
 */

// Move the tach to absolute value provided
EV3.Motor_Move_Absolute = 0x00;
// Move the tach relative to previous position
EV3.Motor_Move_Relative = 0x01;

/*
 * Motor completion
 */

EV3.Motor_Completion_Dont_Wait = 0x00;
EV3.Motor_Completion_Wait_For = 0x01;

/*
 * 0-100
 */
EV3.Speed_Full = 90;
EV3.Speed_Medium = 60;
EV3.Speed_Slow = 25;

/*
 * Motor Port Controls
 */
EV3.CONTROL_SPEED = 0x01;
EV3.CONTROL_RAMP = 0x02;
EV3.CONTROL_RELATIVE = 0x04;
EV3.CONTROL_TACHO = 0x08;
EV3.CONTROL_BRK = 0x10;
EV3.CONTROL_ON = 0x20;
EV3.CONTROL_TIME = 0x40;
EV3.CONTROL_GO = 0x80;

EV3.STATUS_SPEED = 0x01;
EV3.STATUS_RAMP = 0x02;
EV3.STATUS_MOVING = 0x04;
EV3.STATUS_TACHO = 0x08;
EV3.STATUS_BREAK = 0x10;
EV3.STATUS_OVERLOAD = 0x20;
EV3.STATUS_TIME = 0x40;
EV3.STATUS_STALL = 0x80;

EV3.COMMAND = 0x41;
EV3.VOLTAGE = 0x6E;

EV3.SETPT_M1 = 0x42;
EV3.SPEED_M1 = 0x46;
EV3.TIME_M1 = 0x47;
EV3.CMD_B_M1 = 0x48;
EV3.CMD_A_M1 = 0x49;

EV3.SETPT_M2 = 0x4A;
EV3.SPEED_M2 = 0x4E;
EV3.TIME_M2 = 0x4F;
EV3.CMD_B_M2 = 0x50;
EV3.CMD_A_M2 = 0x51;


/*
 * Motor Read registers.
 */
EV3.POSITION_M1 = 0x52;
EV3.POSITION_M2 = 0x56;
EV3.STATUS_M1 = 0x5A;
EV3.STATUS_M2 = 0x5B;
EV3.TASKS_M1 = 0x5C;
EV3.TASKS_M2 = 0x5D;

EV3.ENCODER_PID = 0x5E;
EV3.SPEED_PID = 0x64;
EV3.PASS_COUNT = 0x6A;
EV3.TOLERANCE = 0x6B;

/*
 * Built-in components
 */
EV3.BTN_PRESS = 0xDA;
EV3.RGB_LED = 0xD7;
EV3.CENTER_RGB_LED = 0xDE;



module.exports = EV3;
