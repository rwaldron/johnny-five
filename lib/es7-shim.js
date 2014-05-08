function isConstructor(C) {
  try {
    new C();
    return true;
  } catch (e) {
    return false;
  }
}


Array.build = function(length, mapFn) {

  var len = length >>> 0;
  var C = this;
  var mapping = false;
  var k = 0;
  var A;

  if (isConstructor(C)) {
    A = new C(length);
  } else {
    A = new Array(length);
  }

  if (typeof mapFn === "function") {
    mapping = true;
  }

  while (k < len) {
    A[k] = mapping ? mapFn.call(A, k) : k;
    k++;
  }

  return A;
};



global.Array.build = Array.build;
