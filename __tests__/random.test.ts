import { describe, expect, test } from "vitest";
import { randomInteger, randomUniqueIntegers } from "../src";

const inRange = ({
  min,
  max,
  value,
}: {
  min: number;
  max: number;
  value: number;
}) => min <= value && value <= max;

describe("Random Trials", () => {
  // for (let i = 0; i < 10000; i++) {
  for (let i = 0; i < 100; i++) {
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

describe("RandomArray", () => {
  for (let i = 0; i < 100; i++) {
    test("randomArrayInts", () => {
      const min = randomInteger({ min: -100, max: 1000 });
      const max = min + randomInteger({ min: 20, max: 2000 });

      const randomArray = randomUniqueIntegers({
        min,
        max,
        // inclusiveMax: true,
      });

      const control = Array.from(
        { length: randomArray.length },
        (_, i) => i + min,
      );

      const controlSorted = [...randomArray].sort((a, b) => a - b);

      expect(Math.min(...randomArray)).toBe(min);
      expect(Math.max(...randomArray)).toBe(max - 1);

      // technically can be true, but unlikely
      expect(
        JSON.stringify(randomArray) === JSON.stringify(controlSorted),
      ).toBe(false);

      expect(JSON.stringify(control)).toBe(JSON.stringify(controlSorted));
    });
  }

  // console.log(z);
});
