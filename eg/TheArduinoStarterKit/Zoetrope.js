five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

const enablePin = 9;

board.on("ready", function(){
  motorEnabled = false;
  motorDirection = true;
  motorSpeed = 0;
  controlPin1 = new five.Pin(2);
  controlPin2 = new five.Pin(3);
  controlPin1.high();
  controlPin2.low();
  this.pinMode(enablePin, five.Pin.PWM);

  btnA = new five.Button(4);
  btnB = new five.Button(5);
  btnA.on('down', function(){
    motorEnabled = !motorEnabled;
    board.analogWrite(enablePin, motorEnabled ? motorSpeed : 0)
  })
  btnB.on('down', function(){
    motorDirection = !motorDirection;
    motorDirection ? controlPin1.high() :controlPin1.low();
    motorDirection ? controlPin2.low() :controlPin2.high();
    board.analogWrite(enablePin, motorEnabled ? motorSpeed : 0)
  })

  sensor = new five.Sensor('A0');
  sensor.on('change', function(){
    motorSpeed = five.Fn.map(this.value, 0, 1023, 0, 255);
    console.log(motorEnabled, motorDirection, motorSpeed);
    board.analogWrite(enablePin, motorEnabled ? motorSpeed : 0)
  })

})
