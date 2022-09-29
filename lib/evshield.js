const Emitter = require("./mixins/emitter");
let shared;

class Bank {
  constructor(options) {
    this.address = options.address;
    this.io = options.io;
    this.io.i2cConfig(options);
  }

  read(register, numBytes, callback) {
    if (register) {
      this.io.i2cRead(this.address, register, numBytes, callback);
    } else {
      this.io.i2cRead(this.address, numBytes, callback);
    }
  }

  write(register, bytes) {
    if (!Array.isArray(bytes)) {
      bytes = [bytes];
    }
    this.io.i2cWrite(this.address, register, bytes);
  }
}

class EVS extends Emitter {
  constructor({io}) {
    super();

    if (shared) {
      return shared;
    }

    this.bank = {
      a: new Bank({
        address: EVS.BANK_A,
        io,
      }),
      b: new Bank({
        address: EVS.BANK_B,
        io,
      })
    };

    shared = this;
  }

  setup({bank, mode}, type) {
    this.bank[bank].write(mode, [type]);
  }

  read(port, register, numBytes, callback) {

    if (port.sensor && port.offset && !EVS.isRawSensor(port)) {
      register += port.offset;
    }

    this.bank[port.bank].read(register, numBytes, callback);
  }

  write({bank}, register, data) {
    this.bank[bank].write(register, data);
  }
}

EVS.shieldPort = pin => {
  const port = EVS[pin];

  if (port === undefined) {
    throw new Error("Invalid EVShield pin name");
  }

  let address;
  let analog;
  let bank;
  let motor;
  let mode;
  let offset;
  let sensor;
  let endsWithS1 = false;

  if (pin.startsWith("BA")) {
    address = EVS.BANK_A;
    bank = "a";
  } else {
    address = EVS.BANK_B;
    bank = "b";
  }

  if (pin.includes("M")) {
    motor = pin.endsWith("M1") ? EVS.S1 : EVS.S2;
  }

  if (pin.includes("S")) {
    endsWithS1 = pin.endsWith("S1");

    // Used for reading 2 byte integer values from raw sensors
    analog = endsWithS1 ? EVS.S1_ANALOG : EVS.S2_ANALOG;
    // Sensor Mode (1 or 2?)
    mode = endsWithS1 ? EVS.S1_MODE : EVS.S2_MODE;
    // Used for read registers
    offset = endsWithS1 ? EVS.S1_OFFSET : EVS.S2_OFFSET;
    // Used to address "sensor type"
    sensor = endsWithS1 ? EVS.S1 : EVS.S2;
  }

  return {
    address,
    analog,
    bank,
    mode,
    motor,
    offset,
    port,
    sensor,
  };
};

EVS.isRawSensor = ({analog}) => analog === EVS.S1_ANALOG || analog === EVS.S2_ANALOG;


/*
 * Shield Registers
 */

EVS.BAS1 = 0x01;
EVS.BAS2 = 0x02;
EVS.BBS1 = 0x03;
EVS.BBS2 = 0x04;

EVS.BAM1 = 0x05;
EVS.BAM2 = 0x06;
EVS.BBM1 = 0x07;
EVS.BBM2 = 0x08;

EVS.BANK_A = 0x1A;
EVS.BANK_B = 0x1B;

EVS.S1 = 0x01;
EVS.S2 = 0x02;

EVS.M1 = 0x01;
EVS.M2 = 0x02;
EVS.MM = 0x03;

EVS.Type_NONE = 0x00;
EVS.Type_SWITCH = 0x01;
EVS.Type_ANALOG = 0x02;

EVS.Type_I2C = 0x09;

/*
 * Sensor Mode NXT
 */
EVS.Type_NXT_LIGHT_REFLECTED = 0x03;
EVS.Type_NXT_LIGHT = 0x04;
EVS.Type_NXT_COLOR = 0x0D;
EVS.Type_NXT_COLOR_RGBRAW = 0x04;
EVS.Type_NXT_COLORRED = 0x0E;
EVS.Type_NXT_COLORGREEN = 0x0F;
EVS.Type_NXT_COLORBLUE = 0x10;
EVS.Type_NXT_COLORNONE = 0x11;


EVS.Type_DATABIT0_HIGH = 0x40;

/*
 * Sensor Port Controls
 */
EVS.S1_MODE = 0x6F;
// EVS.S1_EV3_MODE = 0x6F;
EVS.S1_ANALOG = 0x70;
EVS.S1_OFFSET = 0;

EVS.S2_MODE = 0xA3;
// EVS.S2_EV3_MODE = 0x6F;
EVS.S2_ANALOG = 0xA4;
EVS.S2_OFFSET = 52;

/*
 * Sensor Mode EV3
 */
EVS.Type_EV3_LIGHT_REFLECTED = 0x00;
EVS.Type_EV3_LIGHT = 0x01;
EVS.Type_EV3_COLOR = 0x02;
EVS.Type_EV3_COLOR_REFRAW = 0x03;
EVS.Type_EV3_COLOR_RGBRAW = 0x04;
EVS.Type_EV3_TOUCH = 0x12;
EVS.Type_EV3 = 0x13;

/*
 * Sensor Read Registers
 */
EVS.Light = 0x83;
EVS.Bump = 0x84;
EVS.ColorMeasure = 0x83;
EVS.Proximity = 0x83;
EVS.Touch = 0x83;
EVS.Ultrasonic = 0x81;
EVS.Mode = 0x81;

/*
 * Sensor Read Byte Counts
 */
EVS.Light_Bytes = 2;
EVS.Analog_Bytes = 2;
EVS.Bump_Bytes = 1;
EVS.ColorMeasure_Bytes = 2;
EVS.Proximity_Bytes = 2;
EVS.Touch_Bytes = 1;


/*
 * Motor selection
 */
EVS.Motor_1 = 0x01;
EVS.Motor_2 = 0x02;
EVS.Motor_Both = 0x03;

/*
 * Motor next action
 */
// stop and let the motor coast.
EVS.Motor_Next_Action_Float = 0x00;
// apply brakes, and resist change to tachometer, but if tach position is forcibly changed, do not restore position
EVS.Motor_Next_Action_Brake = 0x01;
// apply brakes, and restore externally forced change to tachometer
EVS.Motor_Next_Action_BrakeHold = 0x02;

EVS.Motor_Stop = 0x60;
EVS.Motor_Reset = 0x52;

/*
 * Motor direction
 */

EVS.Motor_Reverse = 0x00;
EVS.Motor_Forward = 0x01;

/*
 * Motor Tachometer movement
 */

// Move the tach to absolute value provided
EVS.Motor_Move_Absolute = 0x00;
// Move the tach relative to previous position
EVS.Motor_Move_Relative = 0x01;

/*
 * Motor completion
 */

EVS.Motor_Completion_Dont_Wait = 0x00;
EVS.Motor_Completion_Wait_For = 0x01;

/*
 * 0-100
 */
EVS.Speed_Full = 90;
EVS.Speed_Medium = 60;
EVS.Speed_Slow = 25;

/*
 * Motor Port Controls
 */
EVS.CONTROL_SPEED = 0x01;
EVS.CONTROL_RAMP = 0x02;
EVS.CONTROL_RELATIVE = 0x04;
EVS.CONTROL_TACHO = 0x08;
EVS.CONTROL_BRK = 0x10;
EVS.CONTROL_ON = 0x20;
EVS.CONTROL_TIME = 0x40;
EVS.CONTROL_GO = 0x80;

EVS.STATUS_SPEED = 0x01;
EVS.STATUS_RAMP = 0x02;
EVS.STATUS_MOVING = 0x04;
EVS.STATUS_TACHO = 0x08;
EVS.STATUS_BREAK = 0x10;
EVS.STATUS_OVERLOAD = 0x20;
EVS.STATUS_TIME = 0x40;
EVS.STATUS_STALL = 0x80;

EVS.COMMAND = 0x41;
EVS.VOLTAGE = 0x6E;

EVS.SETPT_M1 = 0x42;
EVS.SPEED_M1 = 0x46;
EVS.TIME_M1 = 0x47;
EVS.CMD_B_M1 = 0x48;
EVS.CMD_A_M1 = 0x49;

EVS.SETPT_M2 = 0x4A;
EVS.SPEED_M2 = 0x4E;
EVS.TIME_M2 = 0x4F;
EVS.CMD_B_M2 = 0x50;
EVS.CMD_A_M2 = 0x51;


/*
 * Motor Read registers.
 */
EVS.POSITION_M1 = 0x52;
EVS.POSITION_M2 = 0x56;
EVS.STATUS_M1 = 0x5A;
EVS.STATUS_M2 = 0x5B;
EVS.TASKS_M1 = 0x5C;
EVS.TASKS_M2 = 0x5D;

EVS.ENCODER_PID = 0x5E;
EVS.SPEED_PID = 0x64;
EVS.PASS_COUNT = 0x6A;
EVS.TOLERANCE = 0x6B;

/*
 * Built-in components
 */
EVS.BTN_PRESS = 0xDA;
EVS.RGB_LED = 0xD7;
EVS.CENTER_RGB_LED = 0xDE;



module.exports = EVS;
