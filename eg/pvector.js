/*

PVector

Processing.js
Copyright (C) 2008 John Resig
Copyright (C) 2009-2011; see the AUTHORS file for authors and
copyright holders.
*/

function PVector( x, y, z ) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

PVector.degrees = function(angle) {
  return (angle * 180) / Math.PI;
};

PVector.fromAngle = function(angle, v) {
  if (v === undefined || v === null) {
    v = new PVector();
  }
  v.x = Math.cos(angle);
  v.y = Math.sin(angle);
  return v;
};


PVector.dist = function(v1, v2) {
  return v1.dist(v2);
};

PVector.dot = function(v1, v2) {
  return v1.dot(v2);
};

PVector.cross = function(v1, v2) {
  return v1.cross(v2);
};

PVector.sub = function(v1, v2) {
  return new PVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};

PVector.between = function(v1, v2) {
  return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
};

// Common vector operations for PVector
PVector.prototype = {
  constructor: PVector,
  set: function(v, y, z) {
    if (arguments.length === 1) {
      this.set(v.x || v[0] || 0,
               v.y || v[1] || 0,
               v.z || v[2] || 0);
    } else {
      this.x = v;
      this.y = y;
      this.z = z;
    }
  },
  get: function() {
    return new PVector(this.x, this.y, this.z);
  },
  mag: function() {
    var x = this.x,
        y = this.y,
        z = this.z;
    return Math.sqrt(x * x + y * y + z * z);
  },
  magSq: function() {
    var x = this.x,
        y = this.y,
        z = this.z;
    return (x * x + y * y + z * z);
  },
  setMag: function(v_or_len, len) {
    if (len === undefined) {
      len = v_or_len;
      this.normalize();
      this.mult(len);
    } else {
      var v = v_or_len;
      v.normalize();
      v.mult(len);
      return v;
    }
  },
  add: function(v, y, z) {
    if (arguments.length === 1) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    } else {
      this.x += v;
      this.y += y;
      this.z += z;
    }
  },
  sub: function(v, y, z) {
    if (arguments.length === 1) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
    } else {
      this.x -= v;
      this.y -= y;
      this.z -= z;
    }
  },
  mult: function(v) {
    if (typeof v === 'number') {
      this.x *= v;
      this.y *= v;
      this.z *= v;
    } else {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
    }
  },
  div: function(v) {
    if (typeof v === 'number') {
      this.x /= v;
      this.y /= v;
      this.z /= v;
    } else {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
    }
  },
  rotate: function(angle) {
    var prev_x = this.x;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    this.x = c * this.x - s * this.y;
    this.y = s * prev_x + c * this.y;
  },
  dist: function(v) {
    var dx = this.x - v.x,
        dy = this.y - v.y,
        dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  dot: function(v, y, z) {
    if (arguments.length === 1) {
      return (this.x * v.x + this.y * v.y + this.z * v.z);
    }
    return (this.x * v + this.y * y + this.z * z);
  },
  cross: function(v) {
    var x = this.x,
        y = this.y,
        z = this.z;
    return new PVector(y * v.z - v.y * z,
                       z * v.x - v.z * x,
                       x * v.y - v.x * y);
  },
  normalize: function() {
    var m = this.mag();
    if (m > 0) {
      this.div(m);
    }
  },
  toString: function() {
    return "[" + this.x + ", " + this.y + ", " + this.z + "]";
  }
};


function returnFunc(method) {
  return function(v1, v2) {
    var v = v1.get();
    v[method](v2);
    return v;
  };
}


for (var method in PVector.prototype) {
  if (!PVector[method]) {
    PVector[method] = returnFunc(method);
  }
}

exports.PVector = PVector;
