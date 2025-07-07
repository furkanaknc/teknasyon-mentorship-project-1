import { INestApplication } from '@nestjs/common';

declare global {
  // eslint-disable-next-line no-var
  var app: INestApplication;
}

jest.setTimeout(30000);

beforeAll(() => {
  if (process.env.NODE_ENV === 'test') {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

afterAll(async () => {
  if (global.app) {
    await global.app.close();
  }
});
