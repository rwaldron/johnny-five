require("./common/bootstrap");

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
    test.expect(2);
    test.equal(Fn.fmap(500, 0, 1000, 0, 255), 127.5);
    test.equal(Fn.fmap(512, 0, 1023, 0, 255), 127.6246337890625);
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

  inRange: function(test) {
    test.expect(6);

    var a = Fn.inRange(5, 4, 6);
    var b = Fn.inRange(5, 4.5, 5.5);
    var c = Fn.inRange(5, -1, 5);
    var d = Fn.inRange(0, -9, -1);
    var e = Fn.inRange(0, -9, -3);
    var f = Fn.inRange(0, -10, -2);

    test.equal(a, true);
    test.equal(b, true);
    test.equal(c, true);
    test.equal(d, false);
    test.equal(e, false);
    test.equal(f, false);


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

    test.deepEqual(a, [0, 1, 2, 3, 4]);
    test.deepEqual(b, [5, 6, 7, 8, 9, 10]);
    test.deepEqual(c, [3, 6, 9, 12, 15, 18, 21, 24, 27]);

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
      d = [0, 1];

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

  bitSize: function(test) {
    test.expect(5);

    test.equal(Fn.bitSize(1000), 10);
    test.equal(Fn.bitSize(1024), 10);
    test.equal(Fn.bitSize(Number.MAX_SAFE_INTEGER), 53);
    test.equal(Fn.bitSize(Number.MAX_VALUE), 1024);
    test.equal(Fn.bitSize(8), 3);

    test.done();
  },

  toFixed: function(test) {
    test.expect(4);

    test.equal(typeof Fn.toFixed(0.123456789), "number");
    test.equal(Fn.toFixed(0.123456789), 0);
    test.equal(Fn.toFixed(0.123456789, 2), 0.12);
    test.equal(Fn.toFixed(3 / 7, 1), 0.4);
    test.done();
  },
  toFixedDoesNotThrow: function(test) {
    test.expect(2);

    test.doesNotThrow(function() {
      Fn.toFixed(null);
    });
    test.doesNotThrow(function() {
      Fn.toFixed(undefined);
    });
    test.done();
  },
};

exports["Fn.* Consts"] = {
  setUp: function(done) {
    done();
  },

  tearDown: function(done) {
    done();
  },

  RAD_TO_DEG: function(test) {
    test.expect(1);
    test.equal(Fn.RAD_TO_DEG, 180 / Math.PI);
    test.done();
  },

  DEG_TO_RAD: function(test) {
    test.expect(1);
    test.equal(Fn.DEG_TO_RAD, Math.PI / 180);
    test.done();
  },

  TAU: function(test) {
    test.expect(1);
    test.equal(Fn.TAU, 2 * Math.PI);
    test.done();
  },
};

var bitSizes = [ 4, 8, 10, 12, 16, 20, 24, 32 ];


exports["Fn.s*"] = {
  setUp: function(done) {
    done();
  },

  tearDown: function(done) {
    done();
  },

  cast: function(test) {
    test.expect(24);

    bitSizes.forEach(function(bits) {
      var decimal = Fn["POW_2_" + bits];
      var half = decimal / 2 >>> 0;
      test.equal(Fn["s" + bits](decimal - 1), decimal - decimal - 1);
      test.equal(Fn["s" + bits](half), -half);
      test.equal(Fn["s" + bits](half + 1), -half + 1);
    });

    test.done();
  },
};

exports["Fn.u*"] = {
  setUp: function(done) {
    done();
  },

  tearDown: function(done) {
    done();
  },

  cast: function(test) {
    test.expect(bitSizes.length);

    bitSizes.forEach(function(bits) {
      var decimal = Fn["POW_2_" + bits];
      test.equal(Fn["u" + bits](decimal - 1), decimal - 1);
    });

    test.done();
  },
};

exports["Fn.POW_2_*"] = {
  setUp: function(done) {
    done();
  },

  tearDown: function(done) {

    done();
  },

  maxSafeIntegerBits: function(test) {
    var MAX = Fn.bitSize(Number.MAX_SAFE_INTEGER);

    test.expect(MAX);

    for (var i = 0; i < MAX; i++) {
      test.equal(Fn["POW_2_" + i], Math.pow(2, i));
    }

    test.done();
  }

};
