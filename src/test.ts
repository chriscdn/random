import { randomFloat, randomUUID } from ".";

const randomInt = randomFloat({
  min: 0.5,
  max: 0.9,
});

console.log(randomInt);
console.log(randomUUID());
