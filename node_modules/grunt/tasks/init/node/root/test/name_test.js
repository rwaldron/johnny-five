var {%= js_safe_name %} = require('../lib/{%= name %}.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal({%= js_safe_name %}.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
