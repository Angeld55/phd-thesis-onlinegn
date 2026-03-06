import { deepCopy } from './deep-copy';

describe('deepCopy', () => {
  it('should return primitives as is', () => {
    expect(deepCopy(42)).toBe(42);
    expect(deepCopy('hello')).toBe('hello');
    expect(deepCopy(null)).toBe(null);
    expect(deepCopy(undefined)).toBe(undefined);
    expect(deepCopy(true)).toBe(true);
  });

  it('should create a deep copy of a Date object', () => {
    const date = new Date();
    const copiedDate = deepCopy(date);
    expect(copiedDate).not.toBe(date);
    expect(copiedDate.getTime()).toBe(date.getTime());
  });

  it('should create a deep copy of an array', () => {
    const array = [1, 2, { a: 3 }];
    const copiedArray = deepCopy(array);
    expect(copiedArray).not.toBe(array);
    expect(copiedArray).toEqual(array);
    expect(copiedArray[2]).not.toBe(array[2]);
  });

  it('should create a deep copy of an object', () => {
    const obj = { a: 1, b: { c: 2 } };
    const copiedObj = deepCopy(obj);
    expect(copiedObj).not.toBe(obj);
    expect(copiedObj).toEqual(obj);
    expect(copiedObj.b).not.toBe(obj.b);
  });
});
