const {Animation, Board, Servos} = require("../");
const board = new Board();
const controller = "PCA9685";

board.on("ready", function() {
  const servos = new Servos([
    { controller, pin: 0 },
    { controller, pin: 1 },
    { controller, pin: 2 },
    { controller, pin: 3 },
    { controller, pin: 4 },
    { controller, pin: 5 },
  ]);

  const animation = new Animation(servos);

  // Create an animation segment object
  animation.enqueue({
    duration: 2000,
    cuePoints: [0, 0.5, 1.0],
    keyFrames: [
      [{degrees: 0}, {degrees: 180}, {degrees: 150}],
      [{degrees: 0}, {degrees: 180}, {degrees: 120}],
      [{degrees: 0}, {degrees: 180}, {degrees: 90}],
      [{degrees: 0}, {degrees: 180}, {degrees: 60}],
      [{degrees: 0}, {degrees: 180}, {degrees: 30}],
      [{degrees: 0}, {degrees: 180}, {degrees: 0}],
    ]
  });
});
