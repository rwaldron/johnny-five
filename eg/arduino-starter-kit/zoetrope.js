var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var sensor = new five.Sensor("A0");
  var motor = new five.Motor({
    pins: {
      pwm: 9,
      dir: 2,
      cdir: 3
    }
  });
  var btnA = new five.Button(4);
  var btnB = new five.Button(5);

  var enabled = false;
  var direction = "forward";
  var speed = 255;

  btnA.on("down", function() {
    enabled = !enabled;
    update();
  });

  btnB.on("down", function() {
    direction = direction === "forward" ? "reverse" : "forward";
    update();
  });

  sensor.on("change", function() {
    direction = this.value >> 2;
    update();
  });

  function update() {
    if (enabled) {
      motor[direction](speed);
    } else {
      motor.stop();
    }
  }
});
