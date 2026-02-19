"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  pickOne: () => pickOne,
  randomAspectRatio: () => randomAspectRatio,
  randomBoolean: () => randomBoolean,
  randomFloat: () => randomFloat,
  randomId: () => randomId,
  randomInteger: () => randomInteger,
  randomIntegerInclusive: () => randomIntegerInclusive,
  randomString: () => randomString,
  randomUUID: () => randomUUID,
  shuffle: () => shuffle
});
module.exports = __toCommonJS(index_exports);
var assert = (condition, message = "Assertion failed") => {
  if (!condition) {
    throw new Error(message);
  }
};
var assertRange = ({
  value,
  min,
  max,
  inclusiveMin = true,
  inclusiveMax = true,
  name = "value"
}) => {
  assert(min <= max, "min must be less than or equal to max");
  const lowerOk = inclusiveMin ? value >= min : value > min;
  const upperOk = inclusiveMax ? value <= max : value < max;
  assert(
    lowerOk && upperOk,
    `${name} must be between ${inclusiveMin ? "[" : "("}${min}, ${max}${inclusiveMax ? "]" : ")"}`
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
    return arr[0] / 4294967296;
  } else {
    return Math.random();
  }
};
var randomFloat = ({ min, max, highEntropy = false }) => {
  assert(min <= max, "min must be less than or equal to max");
  return _random01({ highEntropy }) * (max - min) + min;
};
var randomInteger = (options) => Math.floor(randomFloat(options));
var randomIntegerInclusive = (options) => {
  assert(
    options.max < Number.MAX_SAFE_INTEGER,
    "max must be less than Number.MAX_SAFE_INTEGER for inclusive range"
  );
  return randomInteger({ ...options, max: options.max + 1 });
};
var pickOne = (arr, { highEntropy = false } = {}) => {
  assert(arr.length > 0, "Cannot pick from an empty array");
  return arr[randomInteger({ min: 0, max: arr.length, highEntropy })];
};
var shuffle = (arr, { highEntropy = false, inPlace = false } = {}) => {
  const arrCopy = inPlace ? arr : arr.slice();
  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = randomIntegerInclusive({ min: 0, max: i, highEntropy });
    [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
  }
  return arrCopy;
};
var randomBoolean = ({ likelihood = 0.5, highEntropy = false } = {}) => {
  assertRange({ value: likelihood, min: 0, max: 1, name: "likelihood" });
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
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => chars[b % charCount]).join("");
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  pickOne,
  randomAspectRatio,
  randomBoolean,
  randomFloat,
  randomId,
  randomInteger,
  randomIntegerInclusive,
  randomString,
  randomUUID,
  shuffle
});
//# sourceMappingURL=index.cjs.map