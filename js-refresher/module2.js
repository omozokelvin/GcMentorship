// Operators & Control Structures

// 1. Control (if / else & switch)

// const statusCode = 404;

// without guard clause
// function checkStatus() {
//   if (statusCode === 200) {
//     console.log('Success');
//   } else if (statusCode === 404) {
//     console.log('Not Found');
//   } else {
//     console.log('Unknown Status');
//   }
// }

// Guard clause pattern
// function checkStatusWithGuardClause() {
//   if (statusCode === 200) {
//     console.log('Success');
//     return;
//   }

//   if (statusCode === 404) {
//     console.log('Not Found');
//     return;
//   }

//   console.log('Unknown Status');
// }

// switch (statusCode) {
//   case 200:
//     console.log('Success');
//     break;

//   case 404:
//   case 400: // fall-through
//     console.log('Not Found');
//     break;

//   default:
//     console.log('Unknown Status');
//     break;
// }

// const errorMessage =
//   statusCode === 200
//     ? 'Success'
//     : statusCode === 404
//       ? 'Not Found'
//       : 'Unknown Status';

// Ternary
const age = 12;
const haveAccessToDrinkBeer = age >= 18 ? 'Adult' : 'Minor';

console.log(haveAccessToDrinkBeer);
