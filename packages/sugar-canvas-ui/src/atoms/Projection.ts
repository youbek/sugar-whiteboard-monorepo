import { Vector } from "./Vector";

export class Projection {
  min: number;
  max: number;
  axis: Vector;

  constructor(axis: Vector, min: number, max: number) {
    this.axis = axis;
    this.min = min;
    this.max = max;
  }

  overlaps(project2: Projection) {
    const isIntersecting =
      (this.min <= project2.max && this.min >= project2.min) ||
      (project2.min <= this.max && project2.min >= this.min);

    return isIntersecting;
  }

  static project(vertices: Vector[], axis: Vector) {
    let min = Vector.dotProduct(vertices[0], axis);
    let max = min;

    for (let i = 1; i < vertices.length; i++) {
      const projection = Vector.dotProduct(vertices[i], axis);

      if (projection < min) {
        min = projection;
      }

      if (projection > max) {
        max = projection;
      }
    }

    return new Projection(axis, min, max);
  }
}
