/**
 * Temporary - The lord of tmp.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */
 
/**
 * Dependencies.
 */
var path = require('path');
var fs = require('fs');
var Tempdir = require('../lib/dir');
var sinon = require('sinon');

describe('Tempdir', function() {
  it('should create file', function() {
    var tmp = new Tempdir('foo');
    path.existsSync(tmp.path).should.be.ok;
  });
  
  describe('rmdir', function() {
    it('should remove the directory', function() {
      var tmp = new Tempdir('foo');
      sinon.spy(fs, 'rmdir');
      tmp.rmdir();
      fs.rmdir.getCall(0).args[0].should.eql(tmp.path);
      fs.rmdir.restore();
    });
  });
  
  describe('rmdirSync', function() {
    it('should remove the directory', function() {
      var tmp = new Tempdir('foo');
      sinon.spy(fs, 'rmdirSync');
      tmp.rmdirSync();
      fs.rmdirSync.getCall(0).args[0].should.eql(tmp.path);
      fs.rmdirSync.restore();
    });
  });
});