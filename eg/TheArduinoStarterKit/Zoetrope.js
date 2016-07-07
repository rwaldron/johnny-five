var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({io: new Edison()});

const enablePin = 9;

board.on("ready", function() {
  var motorEnabled = false;
  var motorDirection = true;
  var motorSpeed = 0;
  var controlPin1 = new five.Pin(2);
  var controlPin2 = new five.Pin(3);
  controlPin1.high();
  controlPin2.low();
  this.pinMode(enablePin, five.Pin.PWM);

  var btnA = new five.Button(4);
  var btnB = new five.Button(5);
  btnA.on("down", function() {
    motorEnabled = !motorEnabled;
    board.analogWrite(enablePin, motorEnabled ? motorSpeed : 0);
  });
  btnB.on("down", function() {
    motorDirection = !motorDirection;
    if (motorDirection) {
      controlPin1.high();
      controlPin2.low();
    } else {
      controlPin1.low();
      controlPin2.high();
    }
    board.analogWrite(enablePin, motorEnabled ? motorSpeed : 0);
  });

  var sensor = new five.Sensor("A0");
  sensor.on("change", function() {
    motorSpeed = five.Fn.map(this.value, 0, 1023, 0, 255);
    console.log(motorEnabled, motorDirection, motorSpeed);
    board.analogWrite(enablePin, motorEnabled ? motorSpeed : 0);
  });

});
