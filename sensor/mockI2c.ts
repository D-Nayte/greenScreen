// mock the i2c class from the4 "i2c-bus" package

export class MockI2C {
  constructor() {}

  openSync(number: number) {
    console.log(`Mocking ic2 buss number ${number}`);
  }
}
