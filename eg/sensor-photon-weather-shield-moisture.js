var five = require("../lib/johnny-five");
var Photon = require("particle-io");
var board = new five.Board({
  io: new Photon({
    token: process.env.PARTICLE_TOKEN,
    deviceId: process.env.PARTICLE_PHOTON_1
  })
});

var period = process.argv[2] || 1000;

board.on("ready", function() {
  console.log("Connected");

  var moisture = new five.Sensor({
    pin: "A1",
    enabled: false
  });
  var power = new five.Pin("D5");

  moisture.on("data", function() {
    if (power.isHigh) {
      console.log("Moisture: ", this.value);
      power.low();
      moisture.disable();
    }
  });

  this.loop(period, function() {
    if (!power.isHigh) {
      power.high();
      moisture.enable();
    }
  });
});

/* @markdown
For this program, you'll need:

![Particle Photon](https://docs.particle.io/assets/images/photon_vector2_600.png)

![SparkFun Photon Weather Shield](https://cdn.sparkfun.com//assets/parts/1/1/0/1/7/13630-01a.jpg)

![SparkFun Soil Moisture Sensor](https://cdn.sparkfun.com//assets/parts/1/0/6/1/0/13322-01.jpg)

@markdown */
