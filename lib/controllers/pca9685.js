var nanosleep = require("../sleep").nano;

function PCA9685(opts) {
  if (!(this instanceof PCA9685)) {
    return new PCA9685(opts);
  }

  this.board = opts.board;
  // TODO: Just always require opts.io?
  this.io = opts.io || this.board.io;
  this.address = opts.address || 0x40;
  // TODO: use this
  this.pwmRange = opts.pwmRange || [0, 4095];

  // TODO: This is the existing logic, but it seems odd.
  // If two components are initialized on the same address, we should
  // either overwrite the existing driver or throw an error.
  if (!this.board.Drivers[this.address]) {
    this.initialize();
  }
}

PCA9685.prototype.COMMANDS = {
  PCA9685_MODE1: 0x0,
  PCA9685_PRESCALE: 0xFE,
  LED0_ON_L: 0x6
};

PCA9685.prototype.initialize = function() {
  // TODO: Existing code set an initialized property, but I didn't see
  // it ever being used. As far as I can tell, we're just using this to
  // to track when an address is already in use.
  this.board.Drivers[this.address] = this;

  this.io.i2cConfig();
  // Reset
  this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0x00);
  // Sleep
  this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0x10);
  // Set prescalar
  this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_PRESCALE, 0x70);
  // Wake up
  this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0x00);
  // Wait 5 nanoseconds for restart
  nanosleep(5);
  // Auto-increment
  this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0xa1);
};

PCA9685.prototype.write = function(pin, on, off) {
  this.io.i2cWrite(this.address, [this.COMMANDS.LED0_ON_L + 4 * pin, on, on >> 8, off, off >> 8]);
};

module.exports = PCA9685;
