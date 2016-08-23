var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

function Box(servo, red, green, yellow) {
  this.quietKnock = 10;
  this.loudKnock = 100;
  this.numberOfKnocks = 0;
  this.locked = false;
  this.servo = servo;
  this.red = red;
  this.red.off();
  this.green = green;
  green.on();
  this.yellow = yellow;
  this.yellow.off();
  this.servo.to(0);
  console.log("The box is unlocked!");
}

Box.prototype.lock = function() {
  this.numberOfKnocks = 0;
  this.locked = true;
  this.green.off();
  this.red.on();
  this.servo.to(90);
  console.log("The box is locked!");
};

Box.prototype.knock = function(value) {
  var self = this;

  function checkForKnock(value) {
    if (value > self.quietKnock && value < self.loudKnock) {
      self.yellow.on();
      setTimeout(function() {
        self.yellow.off();
        console.log("Valid knock of value " + value);
      }, 50);
      return true;
    } else {
      console.log("Bad knock value " + value);
      return false;
    }
  }
  if (this.numberOfKnocks >= 3) {
    this.locked = false;
    this.servo.to(0);
    this.green.on();
    this.red.off();
    console.log("The box is unlocked!");
  } else {
    if (checkForKnock(value)) {
      this.numberOfKnocks++;
    }
    console.log(3 - this.numberOfKnocks + " more knocks to go");
  }
};

board.on("ready", function() {
  var piezo = new five.Sensor({
    pin: "A0",
    threshold: 10
  });
  piezo.on("change", function() {
    box.knock(this.value);
  });
  var button = new five.Button(2);
  button.on("press", function() {
    box.lock();
  });

  var yellow = new five.Led(3);
  var green = new five.Led(4);
  var red = new five.Led(5);
  var servo = new five.Servo(9);
  var box = new Box(servo, red, green, yellow);
});
