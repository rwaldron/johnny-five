const SI = 1.70158;
const SIO = 1.70158 * 1.525;
const SB = 7.5625;
const HALF = 0.5;
const {
  PI,
  cos,
  sin,
  sqrt,
} = Math;

const ease = {};
ease.linear = n => n;
ease.inQuad = n => n ** 2;
ease.outQuad = n => n * (2 - n);
ease.inOutQuad = n => {
  n *= 2;
  return n < 1 ?
    HALF * n * n :
    -HALF * (--n * (n - 2) - 1);
};
ease.inCube = n => n ** 3;
ease.outCube = n => --n * n * n + 1;
ease.inOutCube = n => {
  n *= 2;
  return n < 1 ?
    HALF * n ** 3 :
    HALF * ((n -= 2) * n * n + 2);
};

ease.inQuart = n => n ** 4;
ease.outQuart = n => 1 - (--n * n ** 3);
ease.inOutQuart = n => {
  n *= 2;
  return n < 1 ?
    HALF * n ** 4 :
    -HALF * ((n -= 2) * n ** 3 - 2);
};

ease.inQuint = n => n ** 5;
ease.outQuint = n => --n * n ** 4 + 1;
ease.inOutQuint = n => {
  n *= 2;
  return n < 1 ?
    HALF * n ** 5 :
    HALF * ((n -= 2) * n ** 4 + 2);
};

ease.inSine = n => 1 - cos(n * PI / 2);
ease.outSine = n => sin(n * PI / 2);
ease.inOutSine = n => HALF * (1 - cos(PI * n));

ease.inExpo = n => 0 === n ? 0 : 1024 ** (n - 1);
ease.outExpo = n => 1 === n ? n : 1 - 2 ** (-10 * n);
ease.inOutExpo = n => {
  if (n === 0) { return 0; }
  if (n === 1) { return 1; }
  return (n *= 2) < 1 ?
    HALF * (1024 ** (n - 1)) :
    HALF * (-(2 ** (-10 * (n - 1))) + 2);
};

ease.inCirc = n => 1 - sqrt(1 - n * n);
ease.outCirc = n => sqrt(1 - (--n * n));
ease.inOutCirc = n => {
  n *= 2;
  return (n < 1) ?
    -HALF * (sqrt(1 - n * n) - 1) :
    HALF * (sqrt(1 - (n -= 2) * n) + 1);
};

ease.inBack = n => n * n * ((SI + 1) * n - SI);
ease.outBack = n => --n * n * ((SI + 1) * n + SI) + 1;
ease.inOutBack = n => {
  return (n *= 2) < 1 ?
    HALF * (n * n * ((SIO + 1) * n - SIO)) :
    HALF * ((n -= 2) * n * ((SIO + 1) * n + SIO) + 2);
};

ease.outBounce = n => {
  if (n < (1 / 2.75)) {
    return SB * n * n;
  } else if (n < (2 / 2.75)) {
    return SB * (n -= (1.5 / 2.75)) * n + 0.75;
  } else if (n < (2.5 / 2.75)) {
    return SB * (n -= (2.25 / 2.75)) * n + 0.9375;
  } else {
    return SB * (n -= (2.625 / 2.75)) * n + 0.984375;
  }
};

ease.inBounce = n => 1 - ease.outBounce(1 - n);
ease.inOutBounce = n => {
  return n < HALF ?
    ease.inBounce(n * 2) * HALF :
    ease.outBounce(n * 2 - 1) * HALF + HALF;
};

const exportables = {};

Object.keys(ease).forEach(key => {
  exportables[key.toLowerCase()] = ease[key];
});

module.exports = new Proxy({}, {
  get(target, property) {
    return exportables[property.replace(/([a-z])([A-Z])/g, "$1$2").toLowerCase()];
  }
});
