# @chriscdn/random

Simple, type-safe random functions for TypeScript with no dependencies. Optimized for speed by default, with an optional high-entropy mode for sensitive tasks.

## Installing

Using npm:

```bash
npm install @chriscdn/random
```

Using yarn:

```bash
yarn add @chriscdn/random
```

## High Entropy vs. Performance

Most functions in this library allow you to choose between two underlying engines:

1. **Standard (Default)**: Uses `Math.random()`.
2. **High Entropy**: Pass `highEntropy: true` to use the **Web Crypto API** (`crypto.getRandomValues` for most, `crypto.randomUUID` for `randomUUID`). Use this for generating non-predictable IDs or sensitive data, at the cost of some performance.

## Usage

### Numbers & Integers

Handle ranges without manually calculating floors and offsets.

```ts
import {
  randomFloat,
  randomInteger,
  randomIntegerInclusive,
} from "@chriscdn/random";

// Float: 0.0 <= x < 5.0
const offset = randomFloat({ min: 0, max: 5 });

// Integer (Exclusive): Returns 0, 1, or 2
const index = randomInteger({ min: 0, max: 3 });

// Integer (Inclusive): Returns 1 to 6
const d6 = randomIntegerInclusive({ min: 1, max: 6 });

// Using High Entropy for a specific range
const secureValue = randomInteger({ min: 1, max: 100, highEntropy: true });
```

### Arrays & Booleans

```ts
import { pickOne, shuffle, randomBoolean } from "@chriscdn/random";

const colours = ["red", "blue", "green"];

// Pick a single random element
const randomColour = pickOne(colours);

// Returns a new shuffled array; original array remains unchanged
// (use `{inPlace: true}` to shuffle original)
const shuffledColours = shuffle(colours);

// 20% chance to be true
const isRareEvent = randomBoolean({ likelihood: 0.2 });
```

### Random Strings & IDs

Ideal for slugs, short-codes, or mock data.

```ts
import { randomString, randomId, randomUUID } from "@chriscdn/random";

// Default: 20 character alphanumeric string (using Math.random)
const tempId = randomString();

// High-entropy, 22-character unique ID
const id = randomId();
// e.g., "vT5kLp2M9zXjR4vW1nB5tQ"

// Generate a cryptographically secure UUID (v4)
const uuid = randomUUID();
// e.g., "550e8400-e29b-41d4-a716-446655440000"
```

## License

[MIT](LICENSE)
