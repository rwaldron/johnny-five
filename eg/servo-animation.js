const {Animation, Board, Servo} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  // Create a new `servo` hardware instance.
  const servo = new Servo(10);

  // Create a new `animation` instance.
  const animation = new Animation(servo);

  // Enqueue an animation segment with options param
  // See Animation example and docs for details
  animation.enqueue({
    cuePoints: [0, 0.25, 0.75, 1],
    keyFrames: [90, { value: 180, easing: "inQuad" }, { value: 0, easing: "outQuad" }, 90],
    duration: 2000
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo,
    animation
  });
});
