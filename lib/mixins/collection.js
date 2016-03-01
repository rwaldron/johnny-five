function Collection(numsOrObjects) {
  var Type = this.type;
  var initObjects = [];

  this.length = 0;

  if (Array.isArray(numsOrObjects)) {
    initObjects = numsOrObjects;
  } else {
    if (Array.isArray(numsOrObjects.pins)) {
      var keys = Object.keys(numsOrObjects).filter(function(key) {
        return key !== "pins";
      });
      initObjects = numsOrObjects.pins.map(function(pin) {
        var obj = {
          pin: pin
        };

        return keys.reduce(function(accum, key) {
          accum[key] = numsOrObjects[key];
          return accum;
        }, obj);
      });
    }
  }


  if (initObjects) {
    while (initObjects.length) {
      var numOrObject = initObjects.shift();

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

Collection.prototype.forEach = function() {
  [].forEach.apply(this, arguments);
};

module.exports = Collection;
