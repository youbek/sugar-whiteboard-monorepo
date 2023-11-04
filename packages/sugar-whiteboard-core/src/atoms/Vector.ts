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
}
