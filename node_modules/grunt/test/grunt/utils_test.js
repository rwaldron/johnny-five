var grunt = require('../../lib/grunt');
var utils = grunt.utils;

exports['utils'] = {
  'linefeed': function(test) {
    test.expect(1);
    if (process.platform === 'win32') {
      test.equal(utils.linefeed, '\r\n', 'linefeed should be operating-system appropriate.');
    } else {
      test.equal(utils.linefeed, '\n', 'linefeed should be operating-system appropriate.');
    }
    test.done();
  },
  'normalizelf': function(test) {
    test.expect(1);
    if (process.platform === 'win32') {
      test.equal(utils.normalizelf('foo\nbar\r\nbaz\r\n\r\nqux\n\nquux'), 'foo\r\nbar\r\nbaz\r\n\r\nqux\r\n\r\nquux', 'linefeeds should be normalized');
    } else {
      test.equal(utils.normalizelf('foo\nbar\r\nbaz\r\n\r\nqux\n\nquux'), 'foo\nbar\nbaz\n\nqux\n\nquux', 'linefeeds should be normalized');
    }
    test.done();
  }
};
