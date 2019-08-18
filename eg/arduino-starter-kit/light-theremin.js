const five = require("johnny-five");
const Edison = require("edison-io");
const board = new five.Board({
  io: new Edison()
});

board.on("ready", () => {
  const sensor = new five.Sensor({
    pin: "A0",
    freq: 30
  });
  const piezo = new five.Piezo(8);
  let min = 1024;
  let max = 0;

  sensor.on("data", (data) => {
    min = Math.min(min, data.value);
    max = Math.max(max, data.value);
    const pitch = five.Fn.scale(data.value, min, max, 50, 4000);
    piezo.frequency(pitch, 20);
    console.log(min, max, pitch);
  });
});
