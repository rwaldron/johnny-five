var five = require("../lib/johnny-five.js");

new five.Board().on("ready", function() {
  var accel, slider, servos;

  accel = new five.Accelerometer({
    id: "accelerometer",
    pins: [ "I0", "I1" ]
  });

  slider = new five.Sensor({
    id: "slider",
    pin: "I2"
  });

  new five.Servo({
    id: "servo",
    pin: "O0",
    type: "continuous"
  });

  new five.Servo({
    id: "servo",
    pin: "O1"
  });

  servos = new five.Servo.Array();

  slider.scale( 0, 180 ).on("change", function() {
    servos.move( this.value );
  });

  accel.on("acceleration", function() {
    // console.log( this.raw.x, this.raw.y );
  });
});
