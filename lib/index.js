// src/index.ts
var UINT32_MAX_PLUS_ONE = 2 ** 32;
var assert = (condition, message = "Assertion failed") => {
  if (!condition) {
    throw new Error(message);
  }
};
var assertMinMax = ({ min, max }) => {
  assert(min <= max, "min must be less than or equal to max");
};
var assertMinMaxIntegers = ({ min, max }) => {
  assertMinMax({ min, max });
  assert(
    Number.isSafeInteger(min) && Number.isSafeInteger(max),
    "min and max must be safe integers"
  );
};
var assertCryptoRandomValues = () => {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    throw new Error("High-entropy randomness requires crypto.getRandomValues");
  }
};
var assertCryptoUUID = () => {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("UUID generation requires crypto.randomUUID");
  }
};
var _random01 = ({ highEntropy = false } = {}) => {
  if (highEntropy) {
    assertCryptoRandomValues();
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / UINT32_MAX_PLUS_ONE;
  } else {
    return Math.random();
  }
};
var randomFloat = ({
  min,
  max,
  highEntropy = false
}) => {
  assertMinMax({ min, max });
  return _random01({ highEntropy }) * (max - min) + min;
};
var randomInteger = (options) => {
  const { min, max, inclusiveMax } = options;
  const resolvedMax = inclusiveMax ? max + 1 : max;
  assertMinMaxIntegers({ min, max: resolvedMax });
  return Math.floor(
    randomFloat({
      ...options,
      max: resolvedMax
    })
  );
};
var randomIntegerInclusive = (options) => randomInteger({ ...options, inclusiveMax: true });
var pickOne = (arr, { highEntropy = false } = {}) => {
  assert(arr.length > 0, "Cannot pick from an empty array");
  return arr[randomInteger({ min: 0, max: arr.length, highEntropy })];
};
var shuffle = (arr, { highEntropy = false, inPlace = false } = {}) => {
  const arrCopy = inPlace ? arr : arr.slice();
  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = randomInteger({
      min: 0,
      max: i,
      highEntropy,
      inclusiveMax: true
    });
    [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
  }
  return arrCopy;
};
var randomBoolean = ({
  likelihood = 0.5,
  highEntropy = false
} = {}) => {
  assert(
    0 <= likelihood && likelihood <= 1,
    "likelihood must be between 0 and 1, inclusive"
  );
  return randomFloat({ min: 0, max: 1, highEntropy }) < likelihood;
};
var randomAspectRatio = ({
  maxRatio,
  landscapeLikelihood = 0.5,
  highEntropy = false
}) => {
  assert(maxRatio > 0, "maxRatio must be greater than 0");
  const upper = maxRatio >= 1 ? maxRatio : 1 / maxRatio;
  const value = randomFloat({ min: 1, max: upper, highEntropy });
  return randomBoolean({ likelihood: landscapeLikelihood, highEntropy }) ? value : 1 / value;
};
var randomString = ({
  length = 20,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  highEntropy = false
} = {}) => {
  const charCount = chars.length;
  assert(charCount > 0, "Character set cannot be empty");
  assert(length > 0, "length must be greater than zero");
  if (highEntropy) {
    assertCryptoRandomValues();
    const bytes = new Uint32Array(2 * length);
    crypto.getRandomValues(bytes);
    const max = Math.floor(UINT32_MAX_PLUS_ONE / charCount) * charCount;
    const fbytes = bytes.filter((b) => b < max).slice(0, length);
    if (fbytes.length < length) {
      return randomString({ length, chars, highEntropy });
    } else {
      return Array.from(fbytes, (b) => chars[b % charCount]).join("");
    }
  } else {
    return Array.from(
      { length },
      () => chars[randomInteger({ min: 0, max: charCount, highEntropy: false })]
    ).join("");
  }
};
var randomId = () => randomString({ length: 22, highEntropy: true });
var randomUUID = () => {
  assertCryptoUUID();
  return crypto.randomUUID();
};
var randomUniqueIntegers = ({
  min,
  max,
  count,
  highEntropy = false,
  inclusiveMax = false
}) => {
  const theMax = inclusiveMax ? max + 1 : max;
  const theCount = Math.max(0, count ?? Math.max(0, theMax - min));
  assertMinMaxIntegers({ min, max: theMax });
  const range = Math.max(0, theMax - min);
  const items = Array.from({ length: range }, (_, i) => i + min);
  return shuffle(items, { inPlace: true, highEntropy }).slice(0, theCount);
};
export {
  pickOne,
  randomAspectRatio,
  randomBoolean,
  randomFloat,
  randomId,
  randomInteger,
  randomIntegerInclusive,
  randomString,
  randomUUID,
  randomUniqueIntegers,
  shuffle
};
//# sourceMappingURL=index.js.map