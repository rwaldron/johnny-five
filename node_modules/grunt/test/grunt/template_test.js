var grunt = require('../../lib/grunt');
var template = grunt.template;

exports['template'] = {
  'process': function(test) {
    test.expect(4);
    var obj = {
      foo: 'c',
      bar: 'b<%= foo %>d',
      baz: 'a<%= bar %>e'
    };

    test.equal(template.process('<%= foo %>', obj), 'c', 'should retrieve value.');
    test.equal(template.process('<%= bar %>', obj), 'bcd', 'should recurse.');
    test.equal(template.process('<%= baz %>', obj), 'abcde', 'should recurse.');

    obj.foo = '<% oops %';
    test.equal(template.process('<%= baz %>', obj), 'ab<% oops %de', 'should not explode.');
    test.done();
  }
};
