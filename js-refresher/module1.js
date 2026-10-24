// Module 1: JS Fundamentals & Variables

// 1. Primitives vs References
const myName = 'Kelvin'; // String primitive
let age = 20; // Number primitive
const isInstructor = true; // Boolean primitive

const user = { name: 'Alice', age: 30, role: 'instructor' }; // Object reference

user.age = 45;
user.role = 'Admin';
// console.log(user); // { name: 'Alice', age: 45, role: 'Admin' }

// 2. Scoping: let/const vs var

if (true) {
  let blockScoped = 'Visible only inside this block';
  var functionScoped = 'Leaks outside this block';
}

console.log(functionScoped); // 'Leaks outside this block'
