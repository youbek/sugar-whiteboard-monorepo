import { Vector } from "../atoms/Vector";

export class Path {
  private nodes: Vector[];

  constructor() {
    this.nodes = [];
  }

  private optimizePath() {
    console.log("WE WILL OPTIMIZE WITH: Ramer–Douglas–Peucker algorithm!");
  }

  public add(vector: Vector) {
    this.nodes.push(vector);
    this.optimizePath();
  }

  public setPivot(pivot: Vector) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      this.nodes[i] = new Vector(node.x - pivot.x, node.y - pivot.y);
    }
  }

  public *traverse() {
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const currentNode = this.nodes[i];
      const nextNode = this.nodes[i + 1];
      yield [currentNode, nextNode];
    }
  }
}
