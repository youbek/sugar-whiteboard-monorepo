import { Projection } from "../../atoms";
import { Component } from "../components";

export class CollisionEngine {
  public static checkCollision(a: Component, b: Component): boolean {
    // Possible improvement: not all edges need to be checked for SAT collision
    const axes1 = a.edges.map((edge) => edge.perpendicular);

    for (const axis of axes1) {
      const p1 = Projection.project(a.vertices, axis);
      const p2 = Projection.project(b.vertices, axis);

      if (!p1.overlaps(p2)) {
        return false;
      }
    }

    const axes2 = b.edges.map((edge) => edge.perpendicular);
    for (const axis of axes2) {
      const p1 = Projection.project(a.vertices, axis);
      const p2 = Projection.project(b.vertices, axis);

      if (!p1.overlaps(p2)) {
        return false;
      }
    }

    return true;
  }
}
