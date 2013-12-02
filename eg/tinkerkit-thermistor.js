var five = require("../lib/johnny-five.js"),
  Thermistor;

(function() {
  var adcres, beta, kelvin, rb, ginf;

  adcres = 1023;
  // Beta parameter
  beta = 3950;
  // 0°C = 273.15 K
  kelvin = 273.15;
  // 10 kOhm
  rb = 10000;
  // Ginf = 1/Rinf
  ginf = 120.6685;

  Thermistor = {
    c: function(raw) {
      var rthermistor, tempc;

      rthermistor = rb * (adcres / raw - 1);
      tempc = beta / (Math.log(rthermistor * ginf));

      return tempc - kelvin;
    },
    f: function(raw) {
      return (this.c(raw) * 9) / 5 + 32;
    }
  };
}());

new five.Board().on("ready", function() {
  new five.Sensor("I0").on("change", function() {
    console.log("F: ", Thermistor.f(this.value));
    console.log("C: ", Thermistor.c(this.value));
  });
});

// @markdown
// - [TinkerKit Thermistor](http://www.tinkerkit.com/thermistor/)
// - [TinkerKit Shield](http://www.tinkerkit.com/shield/)
// @markdown
