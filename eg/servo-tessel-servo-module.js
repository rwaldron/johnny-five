// Johnny Five version 2 is not supported on the Tessel 2.
// For using Johnny Five on the Tessel 2, stick with version 1 of Johnny Five.

const {Board, Servo} = require("../lib/johnny-five.js");
const Tessel = require("tessel-io");

const board = new Board({
  io: new Tessel()
});

board.on("ready", () => {
  console.log("Connected");

  // Initialize the servo instance
  const servo = new Servo({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pin: 1,
  });

  servo.sweep();
});
