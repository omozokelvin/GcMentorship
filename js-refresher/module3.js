// Functions & Scope

// function statement

console.log(this);

// console.log(calculateTotal(100));

// function calculateTotalFS(price, tax = 0.1) {
//   console.log(this);
//   return price + price * tax;
// }

// calculateTotalFS(100);

// function expressions/arrow functions/ fat arrow functions/ lambda functions

// const calculateTotal = (price, tax = 0.1) => {
//   return price + price * tax; // explicit return
// };

// const calculateTotalFE = (price, tax = 0.1) => {
//   console.log(this);
//   return price + price * tax; // implicit return
// };

// calculateTotalFE(100);

// Arrow functions lexical 'this'

const timer = {
  seconds: 0,
  start() {
    // arrow function captures 'this' from the timer object
    setInterval(() => {
      this.seconds++;
      console.log(`Timer: ${this.seconds} seconds`);
    }, 1000);
  },
};

timer.start();
