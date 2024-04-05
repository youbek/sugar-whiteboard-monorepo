import _, { max, min } from "lodash";
import { lerp } from "../utils/functions";
export class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  get perpendicular(): Vector {
    const vector = new Vector(this.y, -this.x);
    const scaleFactor = 20 / vector.magnitude;

    return new Vector(vector.x * scaleFactor, vector.y * scaleFactor);
  }

  static from([start, end]: Vector[]): Vector {
    return new Vector(end.x - start.x, end.y - start.y);
  }

  static dotProduct(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }

  static clamp(vector: Vector, minVector: Vector, maxVector: Vector) {
    return new Vector(
      _.clamp(vector.x, minVector.x, maxVector.x),
      _.clamp(vector.y, minVector.y, maxVector.y)
    );
  }

  static lerp(a: Vector, b: Vector, t: number) {
    const xChange = lerp(a.x, b.x, t);
    const yChange = lerp(a.y, b.y, t);

    return new Vector(xChange, yChange);
  }
}
