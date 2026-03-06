export enum TriangleOrientation {
  Left = 0,
  Right = 1,
  Top = 2,
  Bottom = 3,
}
export function getTrianglePointsForPolygon(
  x: number,
  y: number,
  height: number,
  halfWidth: number,
  orientation: TriangleOrientation,
): string {
  const tipOfTriangle = { x, y };
  const leftBaseCorner = { x: x - halfWidth, y: y - height };
  const rightBaseCorner = { x: x + halfWidth, y: y - height };
  if (orientation == TriangleOrientation.Right) {
    tipOfTriangle.x = x + height;
    tipOfTriangle.y = y;
    leftBaseCorner.x = x;
    leftBaseCorner.y = y - halfWidth;
    rightBaseCorner.x = x;
    rightBaseCorner.y = y + halfWidth;
  }

  return `${tipOfTriangle.x},${tipOfTriangle.y} ${leftBaseCorner.x},${leftBaseCorner.y} ${rightBaseCorner.x},${rightBaseCorner.y}`;
}
