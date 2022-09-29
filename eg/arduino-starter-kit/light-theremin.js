const {Board, Fn, Sensor, Piezo} = require("../lib/johnny-five.js");
const Edison = require("edison-io");
const board = new Board({
  io: new Edison()
});

board.on("ready", () => {
  const sensor = new Sensor({
    pin: "A0",
    freq: 30
  });
  const piezo = new Piezo(8);
  let min = 1024;
  let max = 0;

  sensor.on("data", () => {
    min = Math.min(min, sensor.value);
    max = Math.max(max, sensor.value);
    const pitch = Fn.scale(sensor.value, min, max, 50, 4000);
    piezo.frequency(pitch, 20);
    console.log(min, max, pitch);
  });
});
