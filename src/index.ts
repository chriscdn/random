const assert = (condition: boolean, message = "Assertion failed") => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertRange = ({
  value,
  min,
  max,
  inclusiveMin = true,
  inclusiveMax = true,
  name = "value",
}: {
  value: number;
  min: number;
  max: number;
  inclusiveMin?: boolean;
  inclusiveMax?: boolean;
  name?: string;
}) => {
  assert(min <= max, "min must be less than or equal to max");

  const lowerOk = inclusiveMin ? value >= min : value > min;
  const upperOk = inclusiveMax ? value <= max : value < max;

  assert(
    lowerOk && upperOk,
    `${name} must be between ${inclusiveMin ? "[" : "("}${min}, ${max}${
      inclusiveMax ? "]" : ")"
    }`,
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
    typeof crypto === "undefined" || typeof crypto.randomUUID !== "function"
  ) {
    throw new Error("UUID generation requires crypto.randomUUID");
  }
};

type NumericRangeOptions = {
  min: number;
  max: number;
  highEntropy?: boolean;
};

const _random01 = (
  { highEntropy = false }: { highEntropy?: boolean } = {},
) => {
  if (highEntropy) {
    assertCryptoRandomValues();
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0]! / 0x100000000; // 2^32
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
const randomFloat = (
  { min, max, highEntropy = false }: NumericRangeOptions,
) => {
  assert(min <= max, "min must be less than or equal to max");
  return _random01({ highEntropy }) * (max - min) + min;
};

/**
 * Returns a random integer between min (inclusive) and max (exclusive).
 *
 * @param {Object} options
 * @param {number} options.min - The lower bound (inclusive).
 * @param {number} options.max - The upper bound (exclusive).
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {number}
 */
const randomInteger = (options: NumericRangeOptions) =>
  Math.floor(randomFloat(options));

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {Object} options
 * @param {number} options.min - The lower bound (inclusive).
 * @param {number} options.max - The upper bound (inclusive).
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {number}
 */
const randomIntegerInclusive = (options: NumericRangeOptions) => {
  assert(
    options.max < Number.MAX_SAFE_INTEGER,
    "max must be less than Number.MAX_SAFE_INTEGER for inclusive range",
  );

  return randomInteger({ ...options, max: options.max + 1 });
};

/**
 * Picks a random element from an array.
 *
 * @template T
 * @param {T[]} arr - The array to pick from. Must not be empty.
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API for higher-entropy randomness.
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
  const arrCopy = inPlace ? arr : arr.slice(); // create a copy
  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = randomIntegerInclusive({ min: 0, max: i, highEntropy });
    [arrCopy[i] as T, arrCopy[j] as T] = [arrCopy[j] as T, arrCopy[i] as T];
  }
  return arrCopy;
};

/**
 * Returns a random boolean based on a likelihood.
 *
 * @param {Object} [options]
 * @param {number} [options.likelihood=0.5] - Probability between 0 and 1.
 *
 * @returns {boolean}
 */
const randomBoolean = (
  { likelihood = 0.5, highEntropy = false }: {
    likelihood?: number;
    highEntropy?: boolean;
  } = {},
) => {
  assertRange({ value: likelihood, min: 0, max: 1, name: "likelihood" });
  return randomFloat({ min: 0, max: 1, highEntropy }) < likelihood;
};

/**
 * Returns a random aspect ratio between 1 and maxRatio, or its reciprocal.
 * Ensures symmetric probability between portrait (<1) and landscape (>1).
 *
 * @param {Object} options
 * @param {number} options.maxRatio - Maximum ratio value. Can be less than 1; the function normalizes it to be >= 1.
 * @param {number} [options.landscapeLikelihood=0.5] - Probability that the returned ratio is landscape (greater than 1).
 *   A value of 0.5 gives equal chance for portrait and landscape.
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

    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => chars[b % charCount]).join("");
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
 * Uses the Web Crypto API `crypto.randomUUID()` implementation,
 * which produces an RFC 4122 compliant v4 UUID.
 *
 * Requires a runtime environment that supports the Web Crypto API.
 * Throws an error if `crypto.randomUUID` is unavailable.
 *
 * @returns {string} A v4 UUID string (e.g. "550e8400-e29b-41d4-a716-446655440000")
 * @throws {Error} If cryptographic randomness is not available.
 */
const randomUUID = () => {
  assertCryptoUUID();
  return crypto.randomUUID();
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
  shuffle,
};
