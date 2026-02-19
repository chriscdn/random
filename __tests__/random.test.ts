import { describe, expect, test } from "vitest";
import { randomInteger } from "../lib";

const inRange = (
  { min, max, value }: { min: number; max: number; value: number },
) => min <= value && value <= max;

describe("Random Trials", () => {
  for (let i = 0; i < 10000; i++) {
    test("randomInteger", () => {
      const min = randomInteger({ min: 1, max: 5000, highEntropy: true });
      const max = min + randomInteger({ min: 1, max: 5000 });

      expect(
        inRange({
          min,
          max,
          value: randomInteger({ min, max }),
        }),
      ).toBe(true);
    });
  }
});
