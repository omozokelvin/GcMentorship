// Functions & Scope

// function statement

// console.log(calculateTotal(100));

// function calculateTotalFS(price: number, tax: number = 0.1): number {
//   return price + price * tax;
// }

// function expressions/arrow functions/ fat arrow functions/ lambda functions

const calculateTotal = (price: number, tax = 0.1): number => {
  return price + price * tax; // explicit return
};

// calculateTotalFS(100);

// calculateTotalFE(100);

// Arrow functions lexical 'this'

type Timer = {
  seconds: number;
  start: () => void;
};

type AdvanceTimer = Timer & {
  secondsSquare: () => number;
};

const timer: AdvanceTimer = {
  seconds: 0,
  start() {
    // arrow function captures 'this' from the timer object
    setInterval(() => {
      this.seconds++;
      console.log(`Timer: ${this.seconds} seconds`);
    }, 1000);
  },
  secondsSquare() {
    return this.seconds ** 2;
  },
};

timer.start();

// FP VS OOP using Cat

//OOP

// class Cat {
//   name: string;
//   age: number;

//   constructor(name: string, age: number) {
//     this.name = name;
//     this.age = age;
//   }

//   meow() {
//     console.log(`${this.name} says meow!`);
//   }
// }

// const myCat = new Cat('Fluffy', 3);

// const yourCat = new Cat('Whiskers', 2);
// myCat.meow();
// yourCat.meow();

// FP
function Cat(name: string, age: number) {
  return {
    name,
    age,
    meow() {
      console.log(`${this.name} says meow!`);
    },
  };
}

const myCat = Cat('Fluffy', 3);
const yourCat = Cat('Whiskers', 2);

myCat.meow();
yourCat.meow();
