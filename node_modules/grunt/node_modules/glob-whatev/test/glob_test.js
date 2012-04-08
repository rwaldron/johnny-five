var path = require('path');
var globsync = require('../lib/glob');

// On Windows, convert all \ to /.
function normalize(filepath) {
  return process.platform === 'win32' ? filepath.replace(/\\/g, '/') : filepath;
}

function makeAbsolute(filepath) {
  var abspath = path.resolve(process.cwd(), filepath);
  if (/\/$/.test(filepath)) { abspath += '/'; }
  return abspath;
}

var allFiles = [
  'test/fixture/boot',
  'test/fixture/foo/',
  'test/fixture/foo/bar/',
  'test/fixture/foo/bar/baz/',
  'test/fixture/foo/bar/baz/boot',
  'test/fixture/foo/bar/boot',
  'test/fixture/foo/boot'
];

function fileList(arr, prefix) {
  return arr.map(function(i) {
    var filepath = allFiles[i];
    return prefix ? normalize(path.join(prefix, filepath)) : filepath;
  });
}

exports['globsync'] = {
  'relative': function(test) {
    test.expect(11);
    test.deepEqual(globsync.glob('test/fixture/*'), fileList([0,1]), 'test/fixture/* should match');
    test.deepEqual(globsync.glob('test/fixture/*/*'), fileList([2,6]), 'test/fixture/* should match');
    test.deepEqual(globsync.glob('test/fixture/**'), fileList([0,1,2,3,4,5,6]), 'test/fixture/** should match');
    test.deepEqual(globsync.glob('test/fixture/**/'), fileList([1,2,3]), 'test/fixture/**/ should match');
    test.deepEqual(globsync.glob('test/fixture/**/b*'), fileList([0,2,3,4,5,6]), 'test/fixture/**/b* should match');
    test.deepEqual(globsync.glob('test/fixture/**/b*/'), fileList([2,3]), 'test/fixture/**/b*/ should match');
    test.deepEqual(globsync.glob('test/fixture/**/b??'), fileList([2,3]), 'test/fixture/**/b?? should match');
    test.deepEqual(globsync.glob('test/fixture/**/b???'), fileList([0,4,5,6]), 'test/fixture/**/b??? should match');
    test.deepEqual(globsync.glob('test/fixture/**/?oo'), fileList([1]), 'test/fixture/**/?oo should match');
    test.deepEqual(globsync.glob('test/fixture/fail'), [], 'test/fixture/fail should match nothing (and not fail)');
    test.deepEqual(globsync.glob('test/fixture/fail/*'), [], 'test/fixture/fail/* should match nothing (and not fail)');
    test.done();
  },
  'absolute': function(test) {
    test.expect(9);
    var prefix = path.resolve(process.cwd());
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/*')), fileList([0,1], prefix), makeAbsolute('test/fixture/*') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/*/*')), fileList([2,6], prefix), makeAbsolute('test/fixture/*/*') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**')), fileList([0,1,2,3,4,5,6], prefix), makeAbsolute('test/fixture/**') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**/')), fileList([1,2,3], prefix), makeAbsolute('test/fixture/**/') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**/b*')), fileList([0,2,3,4,5,6], prefix), makeAbsolute('test/fixture/**/b*') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**/b*/')), fileList([2,3], prefix), makeAbsolute('test/fixture/**/b*/') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**/b??')), fileList([2,3], prefix), makeAbsolute('test/fixture/**/b??') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**/b???')), fileList([0,4,5,6], prefix), makeAbsolute('test/fixture/**/b???') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('test/fixture/**/?oo')), fileList([1], prefix), makeAbsolute('test/fixture/**/?oo') + ' should match');
    test.done();
  },
  'wacky': function(test) {
    test.expect(9);
    process.chdir('lib');
    var prefix = '../';
    test.deepEqual(globsync.glob('../test/fixture/*'), fileList([0,1], prefix), '../test/fixture/* should match');
    test.deepEqual(globsync.glob('../test/fixture/*/*'), fileList([2,6], prefix), '../test/fixture/*/* should match');
    test.deepEqual(globsync.glob('../test/fixture/**'), fileList([0,1,2,3,4,5,6], prefix), '../test/fixture/** should match');
    test.deepEqual(globsync.glob('../test/fixture/**/'), fileList([1,2,3], prefix), '../test/fixture/**/ should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b*'), fileList([0,2,3,4,5,6], prefix), '../test/fixture/**/b* should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b*/'), fileList([2,3], prefix), '../test/fixture/**/b*/ should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b??'), fileList([2,3], prefix), '../test/fixture/**/b?? should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b???'), fileList([0,4,5,6], prefix), '../test/fixture/**/b??? should match');
    test.deepEqual(globsync.glob('../test/fixture/**/?oo'), fileList([1], prefix), '../test/fixture/**/?oo should match');
    process.chdir('..');
    test.done();
  }
};
