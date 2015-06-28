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
    value: function() {}
  },
  normalize: {
    value: function(pin) {
      return pin;
    }
  },
  pinMode: {
    value: function() {}
  },
  digitalWrite: {
    value: function() {}
  },
  pullUp: {
    value: function() {}
  },
  digitalRead: {
    value: function() {}
  },
  analogWrite: {
    value: function() {}
  },
  analogRead: {
    value: function() {}
  },
  servoWrite: {
    value: function() {}
  }
};
