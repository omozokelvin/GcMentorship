export const add = (a, b) => a + b;

export const subtract = (a, b) => a - b;

export class Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

export default Logger;
