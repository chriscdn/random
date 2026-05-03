import { describe, expect, test } from "vitest";
import {
  pickOne,
  randomBoolean,
  randomFloat,
  randomId,
  randomInteger,
  randomString,
  randomUniqueIntegers,
  randomUUID,
  shuffle,
} from "../src";

const inRange = ({
  min,
  max,
  value,
}: {
  min: number;
  max: number;
  value: number;
}) => min <= value && value <= max;

// ---------------------------------------------------------------------------
// randomInteger
// ---------------------------------------------------------------------------
describe("randomInteger", () => {
  for (let i = 0; i < 100; i++) {
    test("stays within [min, max)", () => {
      const min = randomInteger({ min: 1, max: 5000, highEntropy: true });
      const max = min + randomInteger({ min: 1, max: 5000 });
      const value = randomInteger({ min, max });
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThan(max); // exclusive upper bound
      expect(Number.isInteger(value)).toBe(true);
    });
  }

  test("inclusiveMax: true can return max", () => {
    // With a tight range, the inclusive max must be reachable
    const results = new Set(
      Array.from({ length: 200 }, () =>
        randomInteger({ min: 1, max: 2, inclusiveMax: true }),
      ),
    );
    expect(results.has(2)).toBe(true);
  });

  test("min === max returns min (degenerate range)", () => {
    expect(randomInteger({ min: 7, max: 7, inclusiveMax: true })).toBe(7);
  });

  test("throws when min > max", () => {
    expect(() => randomInteger({ min: 10, max: 5 })).toThrow();
  });

  test("throws when min or max is not a safe integer", () => {
    expect(() =>
      randomInteger({ min: 0, max: Number.MAX_SAFE_INTEGER + 1 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// randomFloat
// ---------------------------------------------------------------------------
describe("randomFloat", () => {
  for (let i = 0; i < 100; i++) {
    test("stays within [min, max)", () => {
      const min = -500 + Math.random() * 500;
      const max = min + Math.random() * 500 + 0.001;
      const value = randomFloat({ min, max });
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThan(max);
    });
  }

  test("highEntropy stays within range", () => {
    const value = randomFloat({ min: 0, max: 1, highEntropy: true });
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  test("throws when min > max", () => {
    expect(() => randomFloat({ min: 5, max: 3 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// randomBoolean
// ---------------------------------------------------------------------------
describe("randomBoolean", () => {
  test("likelihood=1 always returns true", () => {
    for (let i = 0; i < 50; i++) {
      expect(randomBoolean({ likelihood: 1 })).toBe(true);
    }
  });

  test("likelihood=0 always returns false", () => {
    for (let i = 0; i < 50; i++) {
      expect(randomBoolean({ likelihood: 0 })).toBe(false);
    }
  });

  test("default likelihood produces both values", () => {
    const results = Array.from({ length: 200 }, () => randomBoolean());
    expect(results.some(Boolean)).toBe(true);
    expect(results.some((v) => !v)).toBe(true);
  });

  test("throws when likelihood is out of [0,1]", () => {
    expect(() => randomBoolean({ likelihood: 1.1 })).toThrow();
    expect(() => randomBoolean({ likelihood: -0.1 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// pickOne
// ---------------------------------------------------------------------------
describe("pickOne", () => {
  test("always returns an element from the array", () => {
    const arr = [10, 20, 30, 40, 50];
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(pickOne(arr));
    }
  });

  test("single-element array always returns that element", () => {
    expect(pickOne([42])).toBe(42);
  });

  test("throws on empty array", () => {
    expect(() => pickOne([])).toThrow();
  });

  test("works with non-numeric types", () => {
    const arr = ["a", "b", "c"];
    expect(arr).toContain(pickOne(arr));
  });
});

// ---------------------------------------------------------------------------
// shuffle
// ---------------------------------------------------------------------------
describe("shuffle", () => {
  test("returns array with same elements", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffle(arr);
    expect([...result].sort((a, b) => a - b)).toEqual(
      [...arr].sort((a, b) => a - b),
    );
  });

  test("does not mutate original array by default", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  test("inPlace: true mutates the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const ref = arr;
    shuffle(arr, { inPlace: true });
    expect(arr).toBe(ref); // same reference
    expect([...arr].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  test("returns the original reference when inPlace: true", () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr, { inPlace: true })).toBe(arr);
  });

  test("produces varied output over many runs", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const seen = new Set(
      Array.from({ length: 50 }, () => shuffle(arr).join(",")),
    );
    expect(seen.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// randomString
// ---------------------------------------------------------------------------
describe("randomString", () => {
  test("returns string of correct length", () => {
    expect(randomString({ length: 10 })).toHaveLength(10);
    expect(randomString({ length: 1 })).toHaveLength(1);
  });

  test("only uses characters from the provided charset", () => {
    const chars = "abc";
    const result = randomString({ length: 50, chars });
    expect([...result].every((c) => chars.includes(c))).toBe(true);
  });

  test("highEntropy respects length and charset", () => {
    const chars = "xyz";
    const result = randomString({ length: 30, chars, highEntropy: true });
    expect(result).toHaveLength(30);
    expect([...result].every((c) => chars.includes(c))).toBe(true);
  });

  test("throws on empty charset", () => {
    expect(() => randomString({ chars: "" })).toThrow();
  });

  test("throws on length <= 0", () => {
    expect(() => randomString({ length: 0 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// randomId
// ---------------------------------------------------------------------------
describe("randomId", () => {
  test("returns a 22-character string", () => {
    expect(randomId()).toHaveLength(22);
  });

  test("only contains alphanumeric characters", () => {
    expect(randomId()).toMatch(/^[A-Za-z0-9]{22}$/);
  });

  test("generates unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => randomId()));
    expect(ids.size).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// randomUUID
// ---------------------------------------------------------------------------
describe("randomUUID", () => {
  test("returns a valid v4 UUID", () => {
    expect(randomUUID()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test("generates unique values", () => {
    const uuids = new Set(Array.from({ length: 100 }, () => randomUUID()));
    expect(uuids.size).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// randomUniqueIntegers
// ---------------------------------------------------------------------------
describe("randomUniqueIntegers", () => {
  test("returns correct count when specified", () => {
    const result = randomUniqueIntegers({ min: 0, max: 100, count: 10 });
    expect(result).toHaveLength(10);
  });

  test("all values are unique", () => {
    const result = randomUniqueIntegers({ min: 0, max: 100, count: 50 });
    expect(new Set(result).size).toBe(result.length);
  });

  test("all values are within [min, max)", () => {
    const result = randomUniqueIntegers({ min: 5, max: 50, count: 20 });
    expect(result.every((v) => v >= 5 && v < 50)).toBe(true);
  });

  test("inclusiveMax: true includes max", () => {
    // Run enough times that max would appear if included
    const results = Array.from({ length: 20 }, () =>
      randomUniqueIntegers({ min: 0, max: 5, inclusiveMax: true }),
    ).flat();
    expect(results).toContain(5);
  });

  test("count=0 returns empty array", () => {
    expect(randomUniqueIntegers({ min: 0, max: 100, count: 0 })).toEqual([]);
  });

  test("count larger than range is clamped to full range", () => {
    const result = randomUniqueIntegers({ min: 0, max: 5, count: 1000 });
    expect(result).toHaveLength(5);
  });

  test("throws when min > max", () => {
    expect(() => randomUniqueIntegers({ min: 10, max: 5 })).toThrow();
  });
});
