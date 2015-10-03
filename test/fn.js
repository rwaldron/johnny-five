var five = require("../lib/johnny-five.js");


var Fn = five.Fn;

exports["Fn"] = {
  setUp: function(done) {
    done();
  },

  tearDown: function(done) {
    done();
  },

  map: function(test) {
    test.expect(3);

    test.equal(Fn.map(1009, 300, 1009, 0, 255), 255);
    test.equal(Fn.map(300, 300, 1009, 0, 255), 0);
    test.equal(Fn.map(500, 0, 1000, 0, 255), 127);

    test.done();
  },

  fmap: function(test) {
    test.expect(1);

    test.equal(Fn.fmap(500, 0, 1000, 0, 255), 127.5);

    test.done();
  },

  constrain: function(test) {
    test.expect(5);

    test.equal(Fn.constrain(100, 0, 255), 100);
    test.equal(Fn.constrain(-1, 0, 255), 0);
    test.equal(Fn.constrain(0, 0, 255), 0);
    test.equal(Fn.constrain(256, 0, 255), 255);
    test.equal(Fn.constrain(255, 0, 255), 255);

    test.done();
  },

  range: function(test) {
    test.expect(6);

    var a = Fn.range(5);
    var b = Fn.range(5, 10);
    var c = Fn.range(3, 27, 3);
    var d = Fn.range(0, -9, -1);
    var e = Fn.range(0, -9, -3);
    var f = Fn.range(0, -10, -2);

    test.deepEqual(a, [ 0, 1, 2, 3, 4 ]);
    test.deepEqual(b, [ 5, 6, 7, 8, 9, 10 ]);
    test.deepEqual(c, [ 3, 6, 9, 12, 15, 18, 21, 24, 27 ]);

    // Negative Range
    test.deepEqual(d, [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
    test.deepEqual(e, [0, -3, -6, -9]);
    test.deepEqual(f, [0, -2, -4, -6, -8, -10]);


    test.done();
  },

  prefixed: function(test) {
    test.expect(4);

    test.deepEqual(Fn.range.prefixed("A", 3), ["A0", "A1", "A2"]);
    test.deepEqual(Fn.range.prefixed("A", 0, 3), ["A0", "A1", "A2", "A3"]);
    test.deepEqual(Fn.range.prefixed("A", 0, 10, 2), ["A0", "A2", "A4", "A6", "A8", "A10"]);
    test.deepEqual(Fn.range.prefixed("A", 0, 9, 3), ["A0", "A3", "A6", "A9"]);

    test.done();
  },

  uid: function(test) {
    test.expect(2);

    var unique = 0;
    var uids = [];
    var uid;

    for (var i = 0; i < 1000; i++) {
      uid = Fn.uid();

      if (uids.indexOf(uid) === -1) {
        unique++;
      }

      uids.push(uid);
    }

    test.equal(unique, 1000);
    test.equal(uids[0].length, 36);
    test.done();
  },

  sum: function(test) {
    test.expect(4);

    var a = 0,
      b = 1,
      c = [],
      d = [0,1];

    test.equal(Fn.sum(a), 0);
    test.equal(Fn.sum(b), 1);
    test.equal(Fn.sum(c), 0);
    test.equal(Fn.sum(d), 1);

    test.done();
  },

  bitValue: function(test) {
    test.expect(4);

    var a = Fn.bitValue(0);
    var b = Fn.bitValue(2);
    var c = Fn.bitValue(7);
    var d = Fn.bitValue(8);

    test.equal(a, 1);
    test.equal(b, 4);
    test.equal(c, 128);
    test.equal(d, 256);

    test.done();
  },

  int16fromtwobytes: function(test) {
    test.expect(6);

    test.equal(Fn.int16(0, 0), 0);
    test.equal(Fn.int16(0, 1), 1);
    test.equal(Fn.int16(1, 4), 260);
    test.equal(Fn.int16(8, 0), 2048);
    test.equal(Fn.int16(255, 255), -1);
    test.equal(Fn.int16(240, 240), -3856);

    test.done();
  },
};
