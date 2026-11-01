// Module 4: Destructuring & Rest / Spread

// 1. Destructuring

const req = {
  body: { title: 'JS Basics', category: 'Tech ' },
  params: { id: '101' },
};

const { title, category } = req.body;

// console.log({ title, category });

// lat, long;
const coordinates: [number, number] = [10, 20];
// const [lat, long] = coordinates;

// console.log({ lat, long });

// 2. Spread Operator (Immutable Copying)

// const originalUser = { name: 'Ayorinde', role: 'Developer' };

// const updatedUser = { role: 'Senior Developer', ...originalUser };

// console.log(updatedUser);

// const setA = [1, 2];
// const setB = [3, 4, ...setA];

// console.log(setB);

// 3. Rest Operator (Gathering)

// const [first, second, ...rest] = [1, 2, 3, 4, 5];

// console.log({ first, second, rest });

// const user = { name: 'Ayorinde', role: 'Developer', age: 30, active: true };

// const { name, ...rest } = user;

// console.log({ name, rest });

function sum(...args: number[]) {
  console.log({ args });

  return args.reduce((acc, curr) => acc + curr, 0);
}

console.log(sum(10, 15, 3, 4, 5));
