// Module 1: JS Fundamentals & Variables

// 1. Primitives vs References
let myName = 'Kelvin';
let age = 20;
const isInstructor = true;

type Role = 'admin' | 'instructor' | 'student';

type User = {
  name: string;
  age: number;
  role: Role;
  isAdmin?: boolean;
};

let user: User;

const secondUser: User = {
  name: 'Bob',
  age: 25,
  role: 'instructor',
};

user = {
  name: 'Alice',
  age: 30,
  role: 'instructor',
  isAdmin: true,
};

user.age = 45;
user.role = 'admin';
// console.log(user); // { name: 'Alice', age: 45, role: 'Admin' }

// 2. Scoping: let/const vs var

if (true) {
  let blockScoped = 'Visible only inside this block';
  var functionScoped = 'Leaks outside this block';
}

// console.log(functionScoped); // 'Leaks outside this block'
