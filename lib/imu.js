var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("../lib/fn.js"),
  Accelerometer = require("../lib/accelerometer.js"),
  Temperature = require("../lib/temperature.js"),
  Gyro = require("../lib/gyro.js");


var priv = new Map(),
  Controllers;

Controllers = {
  /**
   * MPU-6050 3-axis Gyro/Accelerometer and Temperature
   *
   * http://playground.arduino.cc/Main/MPU-6050
   */

  "MPU6050": {    
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.accelerometer = new Accelerometer({
          controller: "MPU6050",
          freq: opts.freq,
          board: this.board
        });

        state.temperature = new Temperature({
          controller: "MPU6050",
          freq: opts.freq,
          board: this.board
        });
        
        state.gyro = new Gyro({
          controller: "MPU6050",
          freq: opts.freq,
          board: this.board
        });
      }
    },
    accelerometer: {
      get: function() {
        return priv.get(this).accelerometer;
      }
    },
    temperature: {
      get: function() {
        return priv.get(this).temperature;
      }
    },
    gyro: {
      get: function() {
        return priv.get(this).gyro;
      }
    }
  }
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;

function IMU(opts) {

  if (!(this instanceof IMU)) {
    return new IMU(opts);
  }

  var controller, state;

  // Initialize a Controller instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers["MPU6050"];
  }

  this.freq = opts.freq || 500;

  state = {};
  priv.set(this, state);

  Object.defineProperties(this, controller);

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }

  setInterval(function() {
    this.emit("data", null, this);
  }.bind(this), this.freq);
}

util.inherits(IMU, Emitter);

module.exports = IMU;
