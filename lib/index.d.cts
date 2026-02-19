type NumericRangeOptions = {
    min: number;
    max: number;
    highEntropy?: boolean;
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
declare const randomFloat: ({ min, max, highEntropy }: NumericRangeOptions) => number;
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
declare const randomInteger: (options: NumericRangeOptions) => number;
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {Object} options
 * @param {number} options.min - The lower bound (inclusive).
 * @param {number} options.max - The upper bound (inclusive).
 * @param {boolean} [options.highEntropy=false] - Use Web Crypto API.
 *
 * @returns {number}
 */
declare const randomIntegerInclusive: (options: NumericRangeOptions) => number;
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
declare const pickOne: <T>(arr: T[], { highEntropy }?: {
    highEntropy?: boolean | undefined;
}) => T;
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
declare const shuffle: <T>(arr: T[], { highEntropy, inPlace }?: {
    highEntropy?: boolean | undefined;
    inPlace?: boolean | undefined;
}) => T[];
/**
 * Returns a random boolean based on a likelihood.
 *
 * @param {Object} [options]
 * @param {number} [options.likelihood=0.5] - Probability between 0 and 1.
 *
 * @returns {boolean}
 */
declare const randomBoolean: ({ likelihood, highEntropy }?: {
    likelihood?: number;
    highEntropy?: boolean;
}) => boolean;
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
declare const randomAspectRatio: ({ maxRatio, landscapeLikelihood, highEntropy, }: {
    maxRatio: number;
    landscapeLikelihood?: number;
    highEntropy?: boolean;
}) => number;
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
declare const randomString: ({ length, chars, highEntropy, }?: {
    length?: number;
    chars?: string;
    highEntropy?: boolean;
}) => string;
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
declare const randomId: () => string;
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
declare const randomUUID: () => `${string}-${string}-${string}-${string}-${string}`;

export { pickOne, randomAspectRatio, randomBoolean, randomFloat, randomId, randomInteger, randomIntegerInclusive, randomString, randomUUID, shuffle };
