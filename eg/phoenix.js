/**
 * This example is used to control a Lynxmotion Phoenix hexapod
 * via an Arduino Mega and DFRobot Mega Sensor Shield along with
 * an Arduino Uno and Sparkfun Joystick Shield
 *
 * Robot
 * http://www.lynxmotion.com/c-117-phoenix.aspx
 * http://arduino.cc/en/Main/ArduinoBoardMegaADK
 * http://www.dfrobot.com/index.php?route=product/product&path=35_124&product_id=560
 *
 * You will want to update a couple of things if you are going to use this code:
 * 1. You can tweak your walk with the "lift" and "s" objects.
 * 2. You can trim your servos by changing the offset values on each servo
 *
 */

var five = require("../lib/johnny-five.js"),
  temporal = require("temporal"),
  board, ph = {
    state: "sleep"
  },
  easeIn = "inQuad",
  easeOut = "outQuad",
  easeInOut = "inOutQuad",

  // This object describes the "leg lift" used in walking
  lift = {
    femur: 30,
    tibia: -20
  },

  // By default, the gait length is about 2". Adjusting this
  // value scales the gait and can really help out if your
  // using servos don't have enough torque resulting in a
  // saggy bottomed Phoenix. Note that the femur and tibia
  // positions are optimized for a gait scale of 1.0.
  gait = 1,

  // This object contains the home positions of each
  // servo in its forward, mid and rear position for
  // walking.
  s = {
    front: {
      coxa: [66 - 26 * gait, 66, 66 + 19 * gait],
      femur: [100, 94, 65],
      tibia: [115, 93, 40]
    },
    mid: {
      coxa: [68 - 16 * gait, 68, 68 + 16 * gait],
      femur: [92, 93, 86],
      tibia: [95, 96, 82]
    },
    rear: {
      coxa: [59 + 18 * gait, 59, 59 - 22 * gait],
      femur: [80, 92, 100],
      tibia: [70, 100, 113]
    }
  };

// Your port addresses will vary
board = new five.Board().on("ready", function() {

  ph.r1c = new five.Servo({
    pin: 23,
    offset: 10,
    startAt: 45
  });
  ph.r1f = new five.Servo({
    pin: 22,
    offset: -6,
    startAt: 180
  });
  ph.r1t = new five.Servo({
    pin: 21,
    offset: -7,
    startAt: 180
  });
  ph.r1 = new five.Servos([ph.r1c, ph.r1f, ph.r1t]);

  ph.l1c = new five.Servo({
    pin: 27,
    invert: true,
    offset: -7,
    startAt: 45
  });
  ph.l1f = new five.Servo({
    pin: 25,
    invert: true,
    offset: -2,
    startAt: 180
  });
  ph.l1t = new five.Servo({
    pin: 24,
    invert: true,
    offset: -8,
    startAt: 180
  });
  ph.l1 = new five.Servos([ph.l1c, ph.l1f, ph.l1t]);

  ph.r2c = new five.Servo({
    pin: 17,
    offset: 16,
    startAt: 45
  });
  ph.r2f = new five.Servo({
    pin: 16,
    offset: 12,
    startAt: 180
  });
  ph.r2t = new five.Servo({
    pin: 15,
    offset: 2,
    startAt: 180
  });
  ph.r2 = new five.Servos([ph.r2c, ph.r2f, ph.r2t]);

  ph.l2c = new five.Servo({
    pin: 20,
    invert: true,
    offset: 21,
    startAt: 45
  });
  ph.l2f = new five.Servo({
    pin: 19,
    invert: true,
    offset: -19,
    startAt: 180
  });
  ph.l2t = new five.Servo({
    pin: 18,
    invert: true,
    offset: -3,
    startAt: 180
  });
  ph.l2 = new five.Servos([ph.l2c, ph.l2f, ph.l2t]);

  ph.r3c = new five.Servo({
    pin: 9,
    invert: true,
    offset: 10,
    startAt: 45
  });
  ph.r3f = new five.Servo({
    pin: 4,
    offset: 1,
    startAt: 180
  });
  ph.r3t = new five.Servo({
    pin: 5,
    offset: -10,
    startAt: 180
  });
  ph.r3 = new five.Servos([ph.r3c, ph.r3f, ph.r3t]);

  ph.l3c = new five.Servo({
    pin: 14,
    offset: 5,
    startAt: 45
  });
  ph.l3f = new five.Servo({
    pin: 2,
    invert: true,
    offset: -5,
    startAt: 180
  });
  ph.l3t = new five.Servo({
    pin: 3,
    invert: true,
    startAt: 180
  });
  ph.l3 = new five.Servos([ph.l3c, ph.l3f, ph.l3t]);

  ph.femurs = new five.Servos([ph.r1f, ph.l1f, ph.r2f, ph.l2f, ph.r3f, ph.l3f]);
  ph.tibia = new five.Servos([ph.r1t, ph.l1t, ph.r2t, ph.l2t, ph.r3t, ph.l3t]);
  ph.coxa = new five.Servos([ph.r1c, ph.l1c, ph.r2c, ph.l2c, ph.r3c, ph.l3c]);
  ph.joints = new five.Servos([ph.coxa, ph.femurs, ph.tibia]);

  ph.legs = new five.Servos([ph.r1c, ph.r1f, ph.r1t, ph.l1c, ph.l1f, ph.l1t, ph.r2c, ph.r2f, ph.r2t, ph.l2c, ph.l2f, ph.l2t, ph.r3c, ph.r3f, ph.r3t, ph.l3c, ph.l3f, ph.l3t]);

  var legsAnimation = new five.Animation(ph.legs);

  var stand = {
    target: ph.joints,
    duration: 500,
    loop: false,
    fps: 100,
    cuePoints: [0, 0.1, 0.3, 0.7, 1.0],
    oncomplete: function() {
      ph.state = "stand";
    },
    keyFrames: [
      [null, {
        degrees: s.front.coxa[1]
      }],
      [null, false, false, {
        degrees: s.front.femur[1] + 26,
        easing: easeOut
      }, {
        degrees: s.front.femur[1],
        easing: easeIn
      }],
      [null, false, {
          degrees: s.front.tibia[1] + 13
        },
        false, {
          degrees: s.front.tibia[1]
        }
      ]
    ]
  };

  var sleep = {
    duration: 500,
    cuePoints: [0, 0.5, 1.0],
    fps: 100,
    target: ph.joints,
    oncomplete: function() {
      ph.state = "sleep";
    },
    keyFrames: [
      [null, false, { degrees: 45, easing: easeOut }],
      [null, { degrees: 136, easing: easeInOut }, { degrees: 180, easing: easeInOut }],
      [null, { degrees: 120, easing: easeInOut }, { step: 60, easing: easeInOut }]
    ]
  };

  var waveRight = {
    duration: 1500,
    cuePoints: [0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    target: ph.r1,
    oncomplete: function() {
      ph.state = "stand";
    },
    keyFrames: [
      [null, false, { degrees: 120, easing: easeInOut }, false, false, false, false, false, { degrees: 52, easing: easeInOut }, {copyDegrees: 0, easing: easeInOut} ], // r1c
      [null, { step: 55, easing: easeInOut }, false, false, false, false, false, false, { step: -55, easing: easeInOut }, {copyDegrees: 0, easing: easeInOut} ], // r1f
      [null, { degrees: 85, easing: easeInOut }, { degrees: 45, easing: easeInOut }, { step: -15, easing: easeInOut}, { step: 30, easing: easeInOut}, { copyDegrees: 3, easing: easeInOut}, { copyFrame: 4 }, { copyDegrees: 2, easing: easeInOut}, { copyFrame: 1 }, {copyDegrees: 0, easing: easeInOut} ]
    ]
  };

  var waveLeft = {
    duration: 1500,
    cuePoints: [0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    target: ph.l1,
    oncomplete: function() {
      ph.state = "stand";
    },
    keyFrames: [
      [null, false, { degrees: 120, easing: easeInOut }, false, false, false, false, false, { degrees: 52, easing: easeInOut }, {copyDegrees: 0, easing: easeInOut} ], // l1c
      [null, { step: 55, easing: easeInOut }, false, false, false, false, false, false, { step: -55, easing: easeInOut }, {copyDegrees: 0, easing: easeInOut} ], // l1f
      [null, { degrees: 85, easing: easeInOut }, { degrees: 45, easing: easeInOut }, { step: -15, easing: easeInOut}, { step: 30, easing: easeInOut}, { copyDegrees: 3, easing: easeInOut}, { copyFrame: 4 }, { copyDegrees: 2, easing: easeInOut}, { copyFrame: 1 }, {copyDegrees: 0, easing: easeInOut} ]
    ]
  };

  ph.walk = function(dir) {
    var a = dir === "rev" ? 0 : 2,
      b = dir === "rev" ? 2 : 0;

    legsAnimation.enqueue({
      duration: 1500,
      cuePoints: [0, 0.25, 0.5, 0.625, 0.75, 0.875, 1.0],
      loop: true,
      loopback: 0.5,
      fps: 100,
      onstop: function() {
        ph.att();
      },
      oncomplete: function() {},
      keyFrames: [
        [ null, null, {degrees: s.front.coxa[a]}, {degrees: s.front.coxa[1]}, {degrees: s.front.coxa[b]}, null, {degrees: s.front.coxa[a]}],
        [ null, { step: lift.femur, easing: easeOut }, {degrees: s.front.femur[a], easing: easeIn}, {degrees: s.front.femur[1]}, {degrees: s.front.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.front.femur[a], easing: easeIn}],
        [ null, { step: lift.tibia, easing: easeOut }, {degrees: s.front.tibia[a], easing: easeIn}, {degrees: s.front.tibia[1]}, {degrees: s.front.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.front.tibia[a], easing: easeIn}],

        [ null, null, {degrees: s.front.coxa[b]}, null, {degrees: s.front.coxa[a]}, {degrees: s.front.coxa[1]}, {degrees: s.front.coxa[b]}],
        [ null, null, {degrees: s.front.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.front.femur[a], easing: easeIn}, {degrees: s.front.femur[1]}, {degrees: s.front.femur[b]}],
        [ null, null, {degrees: s.front.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.front.tibia[a], easing: easeIn}, {degrees: s.front.tibia[1]}, {degrees: s.front.tibia[b]}],

        [ null, null, {degrees: s.mid.coxa[b]}, null, {degrees: s.mid.coxa[a]}, {degrees: s.mid.coxa[1]}, {degrees: s.mid.coxa[b]}],
        [ null, null, {degrees: s.mid.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.mid.femur[a], easing: easeIn}, {degrees: s.mid.femur[1]}, {degrees: s.mid.femur[b]}],
        [ null, null, {degrees: s.mid.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.mid.tibia[a], easing: easeIn}, {degrees: s.mid.tibia[1]}, {degrees: s.mid.tibia[b]}],

        [ null, null, {degrees: s.mid.coxa[a]}, {degrees: s.mid.coxa[1]}, {degrees: s.mid.coxa[b]}, null, {degrees: s.mid.coxa[a]}],
        [ null, { step: lift.femur, easing: easeOut }, {degrees: s.mid.femur[a], easing: easeIn}, {degrees: s.mid.femur[1]}, {degrees: s.mid.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.mid.femur[a], easing: easeIn}],
        [ null, { step: lift.tibia, easing: easeOut }, {degrees: s.mid.tibia[a], easing: easeIn}, {degrees: s.mid.tibia[1]}, {degrees: s.mid.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.mid.tibia[a], easing: easeIn}],

        [ null, null, {degrees: s.rear.coxa[a]}, {degrees: s.rear.coxa[1]}, {degrees: s.rear.coxa[b]}, null, {degrees: s.rear.coxa[a]}],
        [ null, { step: lift.femur, easing: easeOut },  {degrees: s.rear.femur[a], easing: easeIn}, {degrees: s.rear.femur[1]}, {degrees: s.rear.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.rear.femur[a], easing: easeIn}],
        [ null, { step: lift.tibia, easing: easeOut }, {degrees: s.rear.tibia[a], easing: easeIn}, {degrees: s.rear.tibia[1]}, {degrees: s.rear.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.rear.tibia[a], easing: easeIn}],

        [ null, null, {degrees: s.rear.coxa[b]}, null, {degrees: s.rear.coxa[a]}, {degrees: s.rear.coxa[1]}, {degrees: s.rear.coxa[b]}],
        [ null, null, {degrees: s.rear.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.rear.femur[a], easing: easeIn}, {degrees: s.rear.femur[1]}, {degrees: s.rear.femur[b]}],
        [ null, null, {degrees: s.rear.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.rear.tibia[a], easing: easeIn}, {degrees: s.rear.tibia[1]}, {degrees: s.rear.tibia[b]}],
      ]
    });
    return this;
  };

  ph.turn = function(dir) {
    var a = dir === "left" ? 0 : 2,
      b = dir === "left" ? 2 : 0;

    legsAnimation.enqueue({
      duration: 1500,
      fps: 100,
      cuePoints: [0, 0.25, 0.5, 0.625, 0.75, 0.875, 1.0],
      loop: true,
      loopback: 0.5,
      onstop: function() {
        ph.att();
      },
      keyFrames: [
        [ null, null, {degrees: s.front.coxa[a]}, null, {degrees: s.front.coxa[b]}, null, {degrees: s.front.coxa[a]}],
        [ null, null, {degrees: s.front.femur[a]}, { step: lift.femur, easing: easeOut }, {degrees: s.front.femur[b]}, null, {degrees: s.front.femur[a]}],
        [ null, null, {degrees: s.front.tibia[a]}, { step: lift.tibia, easing: easeOut }, {degrees: s.front.tibia[b]}, null, {degrees: s.front.tibia[a]}],

        [ null, null, {degrees: s.front.coxa[a]}, null, {degrees: s.front.coxa[b]}, null, {degrees: s.front.coxa[a]}],
        [ null, { step: lift.femur, easing: easeOut }, {degrees: s.front.femur[a], easing: easeIn}, null, {degrees: s.front.femur[b], easing: easeIn}, { step: lift.femur, easing: easeOut }, {degrees: s.front.femur[a], easing: easeIn}],
        [ null, { step: lift.tibia, easing: easeOut }, {degrees: s.front.tibia[a], easing: easeIn}, null, {degrees: s.front.tibia[b], easing: easeIn}, { step: lift.tibia, easing: easeOut }, {degrees: s.front.tibia[a], easing: easeIn}],

        [ null, null, {degrees: s.mid.coxa[b]}, null, {degrees: s.mid.coxa[a]}, null, {degrees: s.mid.coxa[b]}],
        [ null, { step: lift.femur, easing: easeOut }, {degrees: s.mid.femur[b], easing: easeIn}, null, {degrees: s.mid.femur[a], easing: easeIn}, { step: lift.femur, easing: easeOut }, {degrees: s.mid.femur[b], easing: easeIn}],
        [ null, { step: lift.tibia, easing: easeOut }, {degrees: s.mid.tibia[b], easing: easeIn}, null, {degrees: s.mid.tibia[a], easing: easeIn}, { step: lift.tibia, easing: easeOut }, {degrees: s.mid.tibia[b], easing: easeIn}],

        [ null, null, {degrees: s.mid.coxa[b]}, null, {degrees: s.mid.coxa[a]}, null, {degrees: s.mid.coxa[b]}],
        [ null, null, {degrees: s.mid.femur[b]}, { step: lift.femur, easing: easeOut }, {degrees: s.mid.femur[a]}, null, {degrees: s.mid.femur[b]}],
        [ null, null, {degrees: s.mid.tibia[b]}, { step: lift.tibia, easing: easeOut }, {degrees: s.mid.tibia[a]}, null, {degrees: s.mid.tibia[b]}],

        [ null, null, {degrees: s.rear.coxa[a]}, null, {degrees: s.rear.coxa[b]}, null, {degrees: s.rear.coxa[a]}],
        [ null, null, {degrees: s.rear.femur[a]}, { step: lift.femur, easing: easeOut }, {degrees: s.rear.femur[b]}, null, {degrees: s.rear.femur[a]}],
        [ null, null, {degrees: s.rear.tibia[a]}, { step: lift.tibia, easing: easeOut }, {degrees: s.rear.tibia[b]}, null, {degrees: s.rear.tibia[a]}],

        [ null, null, {degrees: s.rear.coxa[a]}, null, {degrees: s.rear.coxa[b]}, null, {degrees: s.rear.coxa[a]}],
        [ null, { step: lift.femur, easing: easeOut }, {degrees: s.rear.femur[a], easing: easeIn}, null, {degrees: s.rear.femur[b], easing: easeIn}, { step: lift.femur, easing: easeOut }, {degrees: s.rear.femur[a], easing: easeIn}],
        [ null, { step: lift.tibia, easing: easeOut }, {degrees: s.rear.tibia[a], easing: easeIn}, null, {degrees: s.rear.tibia[b], easing: easeIn}, { step: lift.tibia, easing: easeOut }, {degrees: s.rear.tibia[a], easing: easeIn}]
      ]
    });

    return this;

  };

  ph.att = function() {
    var most = 0, grouped, mostIndex, ani, work = [
      { name: "r1", offset: 0, home: s.front.femur[1], thome: s.front.tibia[1], chome: s.front.coxa[1]},
      { name: "r2", offset: 0, home: s.mid.femur[1], thome: s.mid.tibia[1], chome: s.front.coxa[1] },
      { name: "r3", offset: 0, home: s.rear.femur[1], thome: s.rear.tibia[1], chome: s.front.coxa[1] },
      { name: "l1", offset: 0, home: s.front.femur[1], thome: s.front.tibia[1], chome: s.front.coxa[1] },
      { name: "l2", offset: 0, home: s.mid.femur[1], thome: s.mid.tibia[1], chome: s.front.coxa[1] },
      { name: "l3", offset: 0, home: s.rear.femur[1], thome: s.rear.tibia[1], chome: s.front.coxa[1] }
    ];

    work.forEach(function(leg, i) {
      work[i].offset = Math.abs(ph[leg.name + "f"].last.reqDegrees - leg.home);
    });

    if (work[1].offset > work[4].offset) {
      grouped = [
        [0, 2, 4],
        [1, 3, 5]
      ];
    } else {
      grouped = [
        [1, 3, 5],
        [0, 2, 4]
      ];
    }

    grouped.forEach(function(group, i) {
      group.forEach(function(leg, j) {
        temporal.queue([{
          delay: 250 * i,
          task: function() {
            ph[work[leg].name + "f"].to(work[leg].home + lift.femur);
            ph[work[leg].name + "t"].to(work[leg].thome + lift.tibia);
          }
        }, {
          delay: 50,
          task: function() {
            ph[work[leg].name + "c"].to(work[leg].chome);
          }
        }, {
          delay: 50,
          task: function() {
            ph[work[leg].name + "f"].to(work[leg].home);
            ph[work[leg].name + "t"].to(work[leg].thome);
          }
        }]);
      });
    });
    ph.state = "stand";
  };

  ph.sleep = function() {
    legsAnimation.enqueue(sleep);
  };

  ph.waveLeft = function() {
    legsAnimation.enqueue(waveLeft);
  };

  ph.waveRight = function() {
    legsAnimation.enqueue(waveRight);
  };

  ph.stand = function() {
    legsAnimation.enqueue(stand);
  };

  ph.stop = function() {
    legsAnimation.stop();
  };

  // Inject the `ph` object into
  // the Repl instance's context
  // allows direct command line access
  this.repl.inject({
    ph: ph
  });

  ph.sleep();

});
