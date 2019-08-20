const {Accelerometer, Board} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const accelerometer = new Accelerometer({
    controller: "MMA8452"
  });

  // accelerometer.on("change", () => {
  //   console.log("accelerometer");
  //   console.log("  x            : ", this.x);
  //   console.log("  y            : ", this.y);
  //   console.log("  z            : ", this.z);
  //   console.log("  pitch        : ", this.pitch);
  //   console.log("  roll         : ", this.roll);
  //   console.log("  acceleration : ", this.acceleration);
  //   console.log("  inclination  : ", this.inclination);
  //   console.log("  orientation  : ", this.orientation);
  //   console.log("--------------------------------------");
  // });

  ["tap", "tap:single", "tap:double"].forEach((event) => {
    accelerometer.on(event, () => console.log(event));
  });
});
