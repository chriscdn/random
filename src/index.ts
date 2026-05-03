type NumericRangeOptions = {
  min: number;
  max: number;
  highEntropy?: boolean;
};

const UINT32_MAX_PLUS_ONE = 2 ** 32; // 4294967296

const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertMinMax = ({ min, max }: { min: number; max: number }) => {
  assert(min <= max, "min must be less than or equal to max");
};

const assertMinMaxIntegers = ({ min, max }: { min: number; max: number }) => {
  assertMinMax({ min, max });
  assert(
    Number.isSafeInteger(min) && Number.isSafeInteger(max),
    "min and max must be safe integers",
  );
};

const assertCryptoRandomValues = () => {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.getRandomValues !== "function"
  ) {
    throw new Error("High-entropy randomness requires crypto.getRandomValues");
  }
};

const assertCryptoUUID = () => {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.randomUUID !== "function"
  ) {
    throw new Error("UUID generation requires crypto.randomUUID");
  }
};

const _random01 = ({ highEntropy = false }: { highEntropy?: boolean } = {}) => {
  if (highEntropy) {
    assertCryptoRandomValues();
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0]! / UINT32_MAX_PLUS_ONE;
  } else {
    return Math.random();
  }
};

/**
 * Returns a random float between min (inclusive) and max (exclusive).
 *
 * @param {Object} options
 * @param {number} options.min - The lower bound (inclusive).
 * @param {number} options.max - The upper bound (exclusive).
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {number}
 */
const randomFloat = ({
  min,
  max,
  highEntropy = false,
}: NumericRangeOptions) => {
  assertMinMax({ min, max });
  return _random01({ highEntropy }) * (max - min) + min;
};

/**
 * Returns a random integer between min (inclusive) and max (exclusive).
 *
 * @param {Object} options
 * @param {number} options.min - The lower bound (inclusive).
 * @param {number} options.max - The upper bound (exclusive by default).
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 * @param {boolean} [options.inclusiveMax=false] - Toggle inclusive or exclusive max.
 *
 * @returns {number}
 */
const randomInteger = (
  options: NumericRangeOptions & {
    inclusiveMax?: boolean;
  },
) => {
  const { min, max, inclusiveMax } = options;

  const resolvedMax = inclusiveMax ? max + 1 : max;

  assertMinMaxIntegers({ min, max: resolvedMax });

  return Math.floor(
    randomFloat({
      ...options,
      max: resolvedMax,
    }),
  );
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 *
 * @param {Object} options
 * @param {number} options.min - The lower bound (inclusive).
 * @param {number} options.max - The upper bound (inclusive).
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {number}
 * @deprecated Use randomInteger({inclusiveMax:true}) instead
 */
const randomIntegerInclusive = (options: NumericRangeOptions) =>
  randomInteger({ ...options, inclusiveMax: true });

/**
 * Picks a random element from an array.
 *
 * @template T
 * @param {T[]} arr - The array to pick from. Must not be empty.
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API for
 * higher-entropy randomness.
 *
 * @returns {T} A randomly selected element from the array.
 * @throws {Error} If the array is empty.
 */
const pickOne = <T>(arr: T[], { highEntropy = false } = {}): T => {
  assert(arr.length > 0, "Cannot pick from an empty array");
  return arr[randomInteger({ min: 0, max: arr.length, highEntropy })]!;
};

/**
 * Returns a shuffled array using the Fisher-Yates algorithm.
 *
 * If `inPlace` is true, the original array is shuffled directly. Otherwise, a
 * new shuffled copy is returned, leaving the original array unchanged.
 *
 * @template T
 * @param {T[]} arr - The array to shuffle.
 * @param {Object} [options]
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API for
 * higher-entropy randomness.
 * @param {boolean} [options.inPlace=false] - If true, shuffle the original
 * array in place.
 *
 * @returns {T[]} A new array with the elements shuffled.
 */
const shuffle = <T>(
  arr: T[],
  { highEntropy = false, inPlace = false } = {},
): T[] => {
  const arrCopy = inPlace ? arr : arr.slice(); // create a shallow copy
  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = randomInteger({
      min: 0,
      max: i,
      highEntropy,
      inclusiveMax: true,
    });
    [arrCopy[i] as T, arrCopy[j] as T] = [arrCopy[j] as T, arrCopy[i] as T];
  }
  return arrCopy;
};

/**
 * Returns a random boolean based on a likelihood.
 *
 * @param {Object} [options]
 * @param {number} [options.likelihood=0.5] - Probability between 0 and 1.
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {boolean}
 */
const randomBoolean = ({
  likelihood = 0.5,
  highEntropy = false,
}: {
  likelihood?: number;
  highEntropy?: boolean;
} = {}) => {
  assert(
    0 <= likelihood && likelihood <= 1,
    "likelihood must be between 0 and 1, inclusive",
  );

  return randomFloat({ min: 0, max: 1, highEntropy }) < likelihood;
};

/**
 * Returns a random aspect ratio between 1 and maxRatio, or its reciprocal.
 * Ensures symmetric probability between portrait (<1) and landscape (>1).
 *
 * @param {Object} options
 * @param {number} options.maxRatio - Maximum ratio value. Can be less than 1; the function normalizes it to be >= 1.
 * @param {number} [options.landscapeLikelihood=0.5] - Probability that the returned ratio is landscape (greater than 1). A value of 0.5 gives equal chance for portrait and landscape.
 * @param {boolean} [options.highEntropy=false] - Use the Web Crypto API for high-entropy randomness.
 *
 * @returns {number} A ratio between 1/maxRatio and maxRatio, symmetric around 1.
 */
const randomAspectRatio = ({
  maxRatio,
  landscapeLikelihood = 0.5,
  highEntropy = false,
}: {
  maxRatio: number;
  landscapeLikelihood?: number;
  highEntropy?: boolean;
}) => {
  assert(maxRatio > 0, "maxRatio must be greater than 0");

  // Normalize so the upper bound is always >= 1
  const upper = maxRatio >= 1 ? maxRatio : 1 / maxRatio;

  const value = randomFloat({ min: 1, max: upper, highEntropy });

  return randomBoolean({ likelihood: landscapeLikelihood, highEntropy })
    ? value
    : 1 / value;
};

/**
 * Generates a random string of specified length.
 *
 * @param {Object} [options]
 * @param {number} [options.length=20] - Number of characters to generate.
 * @param {string} [options.chars] - Character set to use.
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {string}
 */
const randomString = ({
  length = 20,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  highEntropy = false,
}: { length?: number; chars?: string; highEntropy?: boolean } = {}) => {
  const charCount = chars.length;

  assert(charCount > 0, "Character set cannot be empty");
  assert(length > 0, "length must be greater than zero");

  if (highEntropy) {
    assertCryptoRandomValues();

    const bytes = new Uint32Array(2 * length);

    crypto.getRandomValues(bytes);

    // remove modulo bias
    const max = Math.floor(UINT32_MAX_PLUS_ONE / charCount) * charCount;
    const fbytes = bytes.filter((b) => b < max).slice(0, length);

    if (fbytes.length < length) {
      // try again, which is extremely rare
      return randomString({ length, chars, highEntropy });
    } else {
      return Array.from(fbytes, (b) => chars[b % charCount]).join("");
    }
  } else {
    return Array.from(
      { length },
      () =>
        chars[randomInteger({ min: 0, max: charCount, highEntropy: false })],
    ).join("");
  }
};

/**
 * Generates a 22-character high-entropy unique identifier.
 *
 * The ID is:
 *
 * - Composed of URL-safe characters (A-Z, a-z, 0-9)
 * - Provides ~128 bits of entropy, making collisions extremely unlikely
 * - Comparable in uniqueness to a UUID v4
 * - Suitable for use in URLs, database keys, and other unique token scenarios
 *
 * For custom lengths, alphabets, or entropy settings, use {@link randomString}.
 *
 * @returns {string} A 22-character random string identifier
 */
const randomId = () => randomString({ length: 22, highEntropy: true });

/**
 * Generates a cryptographically secure UUID (version 4).
 *
 * Uses the Web Crypto API `crypto.randomUUID()` implementation, which produces
 * an RFC 4122 compliant v4 UUID.
 *
 * Requires a runtime environment that supports the Web Crypto API. Throws an
 * error if `crypto.randomUUID` is unavailable.
 *
 * @returns {string} A v4 UUID string (e.g.
 * "550e8400-e29b-41d4-a716-446655440000")
 * @throws {Error} If cryptographic randomness is not available.
 */
const randomUUID = () => {
  assertCryptoUUID();
  return crypto.randomUUID();
};

/**
 * Generates a list of unique random integers within a given range.
 *
 * The range is inclusive of `min` and exclusive of `max` by default.
 * The result will contain at most `count` values, or fewer if the range is smaller.
 * Negative `count` values are treated as 0.
 *
 * @param {Object} params
 * @param {number} params.min - Lower bound (inclusive).
 * @param {number} params.max - Upper bound (exclusive by default).
 * @param {number} [params.count] - Number of integers to return. Defaults to the full range.
 * @param {boolean} [params.highEntropy=false] - Use Web Crypto API for higher-entropy randomness.
 * @param {boolean} [params.inclusiveMax=false] - Toggle inclusive or exclusive max.
 *
 * @returns {number[]} An array of unique random integers within [min, max).
 * @throws {Error} If min or max are not safe integers, or if min > max.
 */
const randomUniqueIntegers = ({
  min,
  max,
  count,
  highEntropy = false,
  inclusiveMax = false,
}: NumericRangeOptions & {
  count?: number;
  inclusiveMax?: boolean;
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
  randomUniqueIntegers,
  randomUUID,
  shuffle,
};
