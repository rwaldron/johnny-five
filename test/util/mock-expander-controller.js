module.exports = {
  REGISTER: {
    value: {
      ADDRESS: 0x00,
      IODIR: 0x01,
      GPPU: 0x02,
      GPIO: 0x03,
      OLAT: 0x04,
    }
  },
  initialize: {
    value() {}
  },
  normalize: {
    value(pin) {
      return pin;
    }
  },
  pinMode: {
    value() {}
  },
  digitalWrite: {
    value() {}
  },
  pullUp: {
    value() {}
  },
  digitalRead: {
    value() {}
  },
  analogWrite: {
    value() {}
  },
  analogRead: {
    value() {}
  },
  servoWrite: {
    value() {}
  }
};

module.exports.DEFAULT = module.exports.REGISTER;
