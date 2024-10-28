import { AppSafePipe } from './app-safe.pipe';

describe('AppSafePipe', () => {
  it('create an instance', () => {
    const pipe = new AppSafePipe();
    expect(pipe).toBeTruthy();
  });
});
