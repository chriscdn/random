import { randomUniqueIntegers } from ".";

const randomArray = randomUniqueIntegers({
  min: 0,
  max: 10,
  count: 4,
  inclusiveMax: true,
}).sort((a, b) => a - b);

console.log(randomArray);
