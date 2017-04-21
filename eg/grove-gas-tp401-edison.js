var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Air quality sensor
  // module into the Grove Shield's A0 jack
  var gas = new five.Sensor("A0");
  var startAt = Date.now();

  // Plug the Piezo module into the
  // Grove Shield's D6 jack.
  var alarm = new five.Piezo(6);

  gas.on("change", function() {
    // According to this document:
    // https://software.intel.com/en-us/iot/hardware/sensors/grove-air-quality-sensor
    // The sensor needs 2-3 minutes for "warm up"
    //
    if (isWarming()) {
      return;
    }

    var ppm = toPPM(this.value);

    if (ppm > 400) {
      if (!alarm.isPlaying) {
        alarm.frequency(five.Piezo.Notes.d5, 5000);
      }
    }
  });

  function isWarming() {
    return (Date.now() - startAt) < 180000;
  }

  function toPPM(value) {
    // https://www.seeedstudio.com/wiki/images/e/eb/TP-401A_Indoor_Air_quality_gas_sensor.pdf
    return 25 * value / 1023;
  }

  function quality(ppm) {
    // Adapted from:
    // http://iotdk.intel.com/docs/master/upm/classupm_1_1_t_p401.html
    if (ppm < 50) {
      return "Fresh Air";
    }
    if (ppm < 200) {
      return "Normal Indoor Air";
    }
    if (ppm < 400) {
      return "Low Pollution";
    }
    if (ppm < 600) {
      return "High Pollution - Action Recommended";
    }
    return "Very High Pollution - Take Action Immediately";
  }
});
/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - Buzzer Module](http://www.seeedstudio.com/depot/images/107020000%201.jpg)

![Grove - Air quality sensor](http://www.seeedstudio.com/depot/images/101020021%201.jpg)

- [Grove - Air quality sensor](http://www.seeedstudio.com/depot/Grove-Air-quality-sensor-p-1065.html

@markdown */
