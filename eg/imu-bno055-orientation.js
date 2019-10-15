const {Board, IMU} = require("../");
const board = new Board();

board.on("ready", () => {

  // Borrowed from
  // https://github.com/adafruit/Adafruit_BNO055/blob/master/examples/bunny/bunny.ino
  //
  // Calibration: https://www.youtube.com/watch?v=uH7iQrH3GpA&feature=youtu.be

  const layout = `
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

  const imu = new IMU({
    controller: "BNO055",
    enableExternalCrystal: false // this can be turned on for better performance if you are using the Adafruit board
  });


  imu.orientation.on("change", () => {

    console.log("orientation");
    console.log("  w            : ", imu.quarternion.w);
    console.log("  x            : ", imu.quarternion.x);
    console.log("  y            : ", imu.quarternion.y);
    console.log("  z            : ", imu.quarternion.z);

    console.log("  heading      : ", imu.euler.heading);
    console.log("  roll         : ", imu.euler.roll);
    console.log("  pitch        : ", imu.euler.pitch);

    console.log("--------------------------------------");

  });
});
