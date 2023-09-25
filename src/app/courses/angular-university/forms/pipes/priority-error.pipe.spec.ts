import { PriorityErrorPipe } from './priority-error.pipe';

describe('PriorityErrorPipe', () => {
  it('create an instance', () => {
    const pipe = new PriorityErrorPipe();
    expect(pipe).toBeTruthy();
  });
});
