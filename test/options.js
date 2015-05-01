var Options = require("../lib/board.options.js");

exports["static"] = {

  // Transform string, number and array args into
  // options objects with pin or pins property.
  "Options": function(test) {
    var tests = [{
      opt: 0,
      result: {
        pin: 0
      }
    }, {
      opt: 9,
      result: {
        pin: 9
      }
    }, {
      opt: "A0",
      result: {
        pin: "A0"
      }
    }, {
      opt: ["A0", "A1"],
      result: {
        pins: ["A0", "A1"]
      }
    }, {
      opt: [5, 6],
      result: {
        pins: [5, 6]
      }
    }, {
      opt: {
        pin: 0
      },
      result: {
        pin: 0
      }
    }, {
      opt: {
        pin: 9
      },
      result: {
        pin: 9
      }
    }, {
      opt: {
        pin: "A0"
      },
      result: {
        pin: "A0"
      }
    }, {
      opt: {
        pins: ["A0", "A1"]
      },
      result: {
        pins: ["A0", "A1"]
      }
    }, {
      opt: {
        pins: [5, 6]
      },
      result: {
        pins: [5, 6]
      }
    }];

    test.expect(tests.length);

    tests.forEach(function(set) {
      test.deepEqual(new Options(set.opt), set.result);
    });

    test.done();
  }
};
