// currently not used
import * as d3 from 'd3';

export interface Point {
  x: number;
  y: number;
}

const EPSILON = 1e-6;
export function doubleCompare(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

function distanceSquared(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function comparePoints(a: Point, b: Point): boolean {
  return doubleCompare(a.x, b.x) && doubleCompare(a.y, b.y);
}

// Helper function to calculate the closest point on a line segment to a given point
function closestPointOnLineSegment(p: Point, v: Point, w: Point): Point {
  const l2 = distanceSquared(v, w); // Length squared of the line segment
  if (l2 === 0) return v; // v and w are the same point, return v

  // Calculate projection of point p onto the line segment
  const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  const clampedT = Math.max(0, Math.min(1, t)); // Clamp t between 0 and 1

  // Return the projection point along the line segment
  return {
    x: v.x + clampedT * (w.x - v.x),
    y: v.y + clampedT * (w.y - v.y),
  };
}

// Function to calculate the closest line segment to a given point
function getClosestLineSegment(
  pathPoints: Point[],
  targetPoint: Point,
): Point[] {
  let closestSegment = null;
  let closestDistance = Infinity;

  // Iterate through consecutive pairs of points in the path
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const pointA = pathPoints[i];
    const pointB = pathPoints[i + 1];

    // Get the closest point on the line segment (pointA, pointB) to the target point
    const closestPoint = closestPointOnLineSegment(targetPoint, pointA, pointB);

    // Calculate the distance from the target point to the closest point on the line
    const distSquared = distanceSquared(targetPoint, closestPoint);

    // Update the closest line segment if a closer one is found
    if (distSquared < closestDistance) {
      closestDistance = distSquared;
      closestSegment = [pointA, pointB];
    }
  }

  return closestSegment!;
}

export function getPointsFromPath(pathD: string): Point[] {
  // Regular expression to match commands and their associated coordinates
  const commandPattern = /([MLCQZ])([^MLCQZ]*)/gi;
  let match;
  let points: Point[] = [];

  while ((match = commandPattern.exec(pathD)) !== null) {
    const command = match[1]; // The command character (M, L, C, Q, Z)
    const values = match[2].trim(); // The coordinates for the command

    // Split the coordinates into pairs of numbers (x, y)
    const coordinates = values.split(/[\s,]+/).map(parseFloat);

    // Depending on the command, extract the appropriate points
    if (command === 'M' || command === 'L') {
      // For move (M) and line (L), every two values represent an (x, y) point
      for (let i = 0; i < coordinates.length; i += 2) {
        points.push({ x: coordinates[i], y: coordinates[i + 1] });
      }
    } else if (command === 'C') {
      // For cubic Bézier (C), every six values represent two control points and an end point
      for (let i = 0; i < coordinates.length; i += 6) {
        points.push({ x: coordinates[i + 4], y: coordinates[i + 5] }); // Add the end point
      }
    } else if (command === 'Q') {
      // For quadratic Bézier (Q), every four values represent one control point and an end point
      for (let i = 0; i < coordinates.length; i += 4) {
        points.push({ x: coordinates[i + 2], y: coordinates[i + 3] }); // Add the end point
      }
    } else if (command === 'Z') {
      // Close path (Z) means returning to the start point
    }
  }

  return points;
}
function adjustPathWithNewPoint(pathD: string, newPoint: Point) {
  const points = getPointsFromPath(pathD);
  if (points.length < 4) {
    return pathD;
  }
  let updatedPath = `M${points[0].x},${points[0].y}`; // Start with the first point
  const closestLinePoints = getClosestLineSegment(points, newPoint);

  for (let i = 1; i < points.length - 1; i++) {
    const startPoint = points[i];
    const endPoint = points[i + 1];
    if (
      comparePoints(startPoint, closestLinePoints[0]) &&
      comparePoints(endPoint, closestLinePoints[1])
    ) {
      points[i] = {
        x: startPoint.x,
        y: newPoint.y,
      };
      points[i + 1] = {
        x: endPoint.x,
        y: newPoint.y,
      };
    }
  }

  for (let i = 1; i < points.length - 1; i++) {
    updatedPath += ` L${points[i].x},${points[i].y}`;
  }

  // Add the last vertical segment (from secondPoint to thirdPoint)
  const thirdPoint = points[points.length - 1]; // [24.36, -136.16]
  updatedPath += ` L${thirdPoint.x},${thirdPoint.y}`; // Vertical down to the last point

  return updatedPath;
}

export function createPathDFromPoints(points: Point[]): string {
  let updatedPath = `M${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    updatedPath += ` L${points[i].x},${points[i].y}`;
  }

  const thirdPoint = points[points.length - 1];
  updatedPath += ` L${thirdPoint.x},${thirdPoint.y}`;

  return updatedPath;
}
export class DragBehaviourProvider {
  constructor(private svg: any) {}
  public createBehaviour(): d3.DragBehavior<Element, unknown, unknown> {
    return d3.drag().on('start', this.movePath).on('drag', this.movePath);
  }

  private movePath = (event: any, d: any) => {
    const pathSelector =
      '.' + d.attributes.class.split(' ').join('.') + '>path';
    const pathD = this.svg.select(pathSelector).attr('d');
    const newD = adjustPathWithNewPoint(pathD, {
      x: event.x,
      y: event.y,
    });
    this.svg.select(pathSelector).attr('stroke', 'red').attr('d', newD);
  };
}
