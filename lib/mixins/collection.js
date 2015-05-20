function Collection(numsOrObjects) {
  var Type = this.type;

  this.length = 0;

  if (numsOrObjects) {
    while (numsOrObjects.length) {
      var numOrObject = numsOrObjects.shift();

      if (!(numOrObject instanceof Type || numOrObject instanceof this.constructor)) {
        numOrObject = new Type(numOrObject);
      }
      this.add(numOrObject);
    }
  }
}

Collection.prototype.add = function() {
  var length = this.length;
  var aLen = arguments.length;

  for (var i = 0; i < aLen; i++) {
    if (arguments[i] instanceof this.type || arguments[i] instanceof this.constructor) {
      this[length++] = arguments[i];
    }
  }

  return (this.length = length);
};

Collection.prototype.each = function(callbackFn) {
  var length = this.length;

  for (var i = 0; i < length; i++) {
    callbackFn.call(this[i], this[i], i);
  }

  return this;
};

module.exports = Collection;
