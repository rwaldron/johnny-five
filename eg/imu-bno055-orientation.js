var five = require("johnny-five"),
  board;

board = new five.Board({
  port: "/dev/cu.usbmodem1421"
});

board.on("ready", function () {

  // Borrowed from
  // https://github.com/adafruit/Adafruit_BNO055/blob/master/examples/bunny/bunny.ino
  //
  // Calibration: https://www.youtube.com/watch?v=uH7iQrH3GpA&feature=youtu.be

  var layout = `
  Board layout:
      +----------+
      |         *| RST   PITCH  ROLL  HEADING
  ADR |*        *| SCL
  INT |*        *| SDA     ^            /->
  PS1 |*        *| GND     |            |
  PS0 |*        *| 3VO     Y    Z-->    \-X
      |         *| VIN
      +----------+
  `;

  console.log(layout);

  var imu = new five.IMU({
    controller: "BNO055",
    enableExternalCrystal: true
  });


  imu.orientation.on("change", function () {

    console.log("orientation");
    console.log("  w            : ", this.quarternion.w);
    console.log("  x            : ", this.quarternion.x);
    console.log("  y            : ", this.quarternion.y);
    console.log("  z            : ", this.quarternion.z);

    console.log("  heading      : ", this.euler.heading);
    console.log("  roll         : ", this.euler.roll);
    console.log("  pitch        : ", this.euler.pitch);

    console.log("--------------------------------------");

  });
});