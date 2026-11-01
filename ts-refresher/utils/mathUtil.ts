export const add = (a: number, b: number) => a + b;

export const subtract = (a: number, b: number) => a - b;

export class Logger {
  log(message: number) {
    console.log(`[LOG] ${message}`);
  }
}

export default Logger;
