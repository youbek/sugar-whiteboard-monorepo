import { Vector } from "../atoms/Vector";

export class Path {
  private nodes: Vector[];
  private pivot: Vector = new Vector(0, 0);

  constructor() {
    this.nodes = [];
  }

  private optimizePath() {
    console.log("WE WILL OPTIMIZE WITH: Ramer–Douglas–Peucker algorithm!");
  }

  public getAllNodes() {
    return this.nodes;
  }

  public add(vector: Vector) {
    this.nodes.push(vector);
    this.optimizePath();
  }

  public remove(position: Vector, area: Vector) {
    let i = 0;
    let node = this.nodes[i];
    while (node) {
      // console.log("NODE: ", node, position);

      const min = new Vector(position.x - area.x, position.y - area.y);
      const max = new Vector(position.y + area.y, position.y + area.y);
      const nodeRenderPosition = new Vector(
        node.x + this.pivot.x,
        node.y + this.pivot.y
      );

      if (
        nodeRenderPosition.x >= min.x
        // &&
        // nodeRenderPosition.y >= min.y &&
        // nodeRenderPosition.x <= max.x &&
        // nodeRenderPosition.x <= max.y
      ) {
        console.log("REMOVE THIS NODE!");
        this.nodes.splice(i, 1);
        node = this.nodes[i];
      } else {
        i++;
        node = this.nodes[i];
      }
    }
  }

  public setPivot(pivot: Vector) {
    this.pivot = pivot;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      this.nodes[i] = new Vector(node.x - this.pivot.x, node.y - this.pivot.y);
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
