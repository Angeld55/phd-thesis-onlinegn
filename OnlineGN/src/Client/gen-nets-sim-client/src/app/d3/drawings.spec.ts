import { getTrianglePointsForPolygon, TriangleOrientation } from './drawings';

describe('getTrianglePointsForPolygon', () => {
  it('should return correct points for TriangleOrientation.Left', () => {
    const result = getTrianglePointsForPolygon(
      10,
      20,
      30,
      15,
      TriangleOrientation.Left,
    );
    expect(result).toBe('10,20 -5,-10 25,-10');
  });

  it('should return correct points for TriangleOrientation.Right', () => {
    const result = getTrianglePointsForPolygon(
      10,
      20,
      30,
      15,
      TriangleOrientation.Right,
    );
    expect(result).toBe('40,20 10,5 10,35');
  });

  it('should return correct points for TriangleOrientation.Top', () => {
    const result = getTrianglePointsForPolygon(
      10,
      20,
      30,
      15,
      TriangleOrientation.Top,
    );
    expect(result).toBe('10,20 -5,-10 25,-10');
  });

  it('should return correct points for TriangleOrientation.Bottom', () => {
    const result = getTrianglePointsForPolygon(
      10,
      20,
      30,
      15,
      TriangleOrientation.Bottom,
    );
    expect(result).toBe('10,20 -5,-10 25,-10');
  });
});
