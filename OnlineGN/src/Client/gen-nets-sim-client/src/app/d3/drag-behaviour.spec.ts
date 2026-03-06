import {
  doubleCompare,
  getPointsFromPath,
  createPathDFromPoints,
} from './drag-behaviour';

describe('doubleCompare', () => {
  it('should return true for numbers within EPSILON', () => {
    expect(doubleCompare(1.0000001, 1.0000002)).toBe(true);
  });

  it('should return false for numbers outside EPSILON', () => {
    expect(doubleCompare(1.0001, 1.0002)).toBe(false);
  });
});

describe('getPointsFromPath', () => {
  it('should extract points from a simple path', () => {
    const pathD = 'M10,20 L30,40 L50,60';
    const points = getPointsFromPath(pathD);
    expect(points).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ]);
  });
});

describe('createPathDFromPoints', () => {
  it('should create a path string from points', () => {
    const points = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ];
    const pathD = createPathDFromPoints(points);
    expect(pathD).toBe('M10,20 L30,40 L50,60');
  });

  it('should handle a single point', () => {
    const points = [{ x: 10, y: 20 }];
    const pathD = createPathDFromPoints(points);
    expect(pathD).toBe('M10,20 L10,20');
  });
});
