import { CollisionEngine } from "src/physics";
import { Vector } from "../atoms/Vector";

const LEFT_REGION = 1 as const;
const RIGHT_REGION = 2 as const;
const TOP_REGION = 4 as const;
const BOTTOM_REGION = 8 as const;

type PathConfig = {
  minSpaceBetweenNodes: number;
};
export class Path {
  // null indicates stop for particular path Like(nodeA -> nodeB -> nodeC -> null nodeD -> nodeE)
  // in the above example, nodeA, nodeB, nodeC are all connected, so they form connected path
  // whereas nodeD and nodeE are connected but not to the above path
  private nodes: (Vector | null)[];
  private pathBoundary: {
    left: number;
    right: number;
    bottom: number;
    top: number;
  } | null = null;

  private pivot: Vector = new Vector(0, 0); // top left of the parent
  private minSpaceBetweenNodes = 0;

  constructor(config?: PathConfig) {
    this.minSpaceBetweenNodes =
      config?.minSpaceBetweenNodes === undefined
        ? 100
        : config.minSpaceBetweenNodes;
    this.nodes = [];
  }

  private optimizePath() {
    console.log("WE WILL OPTIMIZE WITH: Ramer–Douglas–Peucker algorithm!");
  }

  /**
   * @returns Position relative to the parent aka screen/canvas position
   */
  public getPosition() {
    if (!this.pathBoundary) return new Vector(0, 0);

    return new Vector(this.pathBoundary.left, this.pathBoundary.top);
  }

  /**
   * @returns Size of the Path
   */
  public getSize() {
    if (!this.pathBoundary) return new Vector(0, 0);

    const x = this.pathBoundary.right - this.pathBoundary.left;
    const y = this.pathBoundary.bottom - this.pathBoundary.top;

    return new Vector(x, y);
  }

  public getAllNodes() {
    return this.nodes;
  }

  /** @description - Adds new node to the path. Automatically updates position, boundary of the path */
  public add(vector: Vector | null) {
    const lastNode = this.nodes[this.nodes.length - 1];
    if (!vector && !lastNode) return;

    if (
      vector &&
      lastNode &&
      Math.abs(lastNode.x - vector.x) + Math.abs(lastNode.y - vector.y) <
        this.minSpaceBetweenNodes
    ) {
      return;
    }

    this.nodes.push(vector);
    // this.optimizePath();

    if (!vector) return;

    if (!this.pathBoundary) {
      this.pathBoundary = {
        left: vector.x,
        right: vector.x,
        top: vector.y,
        bottom: vector.y,
      };
    } else {
      if (vector.x < this.pathBoundary.left) {
        this.pathBoundary.left = vector.x;
      }

      if (vector.x > this.pathBoundary.right) {
        this.pathBoundary.right = vector.x;
      }

      if (vector.y > this.pathBoundary.bottom) {
        this.pathBoundary.bottom = vector.y;
      }

      if (vector.y < this.pathBoundary.top) {
        this.pathBoundary.top = vector.y;
      }
    }
  }

  private getNodeRegionCode(
    node: Vector,
    xMin: number,
    yMin: number,
    xMax: number,
    yMax: number
  ): number {
    let region: any = 0; // 0 means inside

    if (node.x < xMin) {
      region |= LEFT_REGION; // carry flag LEFT
    } else if (node.x > xMax) {
      region |= RIGHT_REGION; // carry flag RIGHT
    }

    if (node.y < yMin) {
      region |= TOP_REGION; // carry flag TOP
    } else if (node.y > yMax) {
      region |= BOTTOM_REGION; // carry flag BOTTOM
    }

    // so |= 1, |= 4 => 5 INDICATES TOP_LEFT
    return region;
  }

  private getIntersectionNode(
    node: Vector,
    nextNode: Vector,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number
  ) {
    const nodeRegionCode = this.getNodeRegionCode(node, xMin, yMin, xMax, yMax);

    if (nodeRegionCode & TOP_REGION) {
      console.log("TOP REGION!");
      return new Vector(
        node.x +
          ((nextNode.x - node.x) * (yMin - node.y)) / (nextNode.y - node.y),
        yMin
      );
    } else if (nodeRegionCode & BOTTOM_REGION) {
      console.log("BOTTOM REGION!");

      return new Vector(
        node.x +
          ((nextNode.x - node.x) * (yMax - node.y)) / (nextNode.y - node.y),
        yMax
      );
    } else if (nodeRegionCode & RIGHT_REGION) {
      console.log("RIGHT REGION!");

      return new Vector(
        xMax,
        node.y +
          ((nextNode.y - node.y) * (xMax - node.x)) / (nextNode.x - node.x)
      );
    } else {
      console.log("LEFT REGION");

      return new Vector(
        xMin,
        node.y +
          ((nextNode.y - node.y) * (xMin - node.x)) / (nextNode.x - node.x)
      );
    }
  }

  // uses Cohen Sutherland line clipping algorithm
  public remove(position: Vector, area: Vector) {
    // console.log("BEFORE PATH: ", this.nodes);
    // console.log("AREA: ", area);

    const newPath = new Path({
      minSpaceBetweenNodes: 0,
    });

    let i = 0;
    const xMin = position.x;
    const xMax = position.x + area.x;
    const yMin = position.y;
    const yMax = position.y + area.y;

    let currentNode = this.nodes[i];
    let nextNode = this.nodes[i + 1];

    while (i < this.nodes.length) {
      if (!currentNode) {
        i++;
        currentNode = this.nodes[i];
        nextNode = this.nodes[i + 1];
        continue;
      }

      const currentNodeRegionCode = this.getNodeRegionCode(
        currentNode,
        xMin,
        yMin,
        xMax,
        yMax
      );

      if (!nextNode) {
        const currentNodeIsInside = currentNodeRegionCode === 0;
        if (!currentNodeIsInside) newPath.add(currentNode);

        i++;
        currentNode = this.nodes[i];
        nextNode = this.nodes[i + 1];
        continue;
      }

      const nextNodeRegionCode = this.getNodeRegionCode(
        nextNode,
        xMin,
        yMin,
        xMax,
        yMax
      );

      const isBothInside =
        currentNodeRegionCode === 0 && nextNodeRegionCode === 0;
      if (isBothInside) {
        console.log(
          `COMPLETELY INSIDE THE AREA: (${currentNode.x}, ${currentNode.y}), (${nextNode.x}, ${nextNode.y})`
        );

        i++;
        currentNode = this.nodes[i];
        nextNode = this.nodes[i + 1];
        continue;
      }

      const isBothOutsideInSameAxis =
        currentNodeRegionCode & nextNodeRegionCode;
      if (isBothOutsideInSameAxis) {
        newPath.add(new Vector(currentNode.x, currentNode.y));

        i++;
        currentNode = this.nodes[i];
        nextNode = this.nodes[i + 1];
        continue;
      }

      const isCurrentNodeOutside = currentNodeRegionCode !== 0;
      const isNextNodeOutside = nextNodeRegionCode !== 0;

      console.log(currentNode);
      console.log(`Is current node outside: `, isCurrentNodeOutside);
      console.log(`Is next node outside: `, isNextNodeOutside);

      /** If both nodes are outside but area intersects between these nodes,
       * then there will be 2 intersection nodes
       * and in the middle there will null, representing cut between 2 nodes */
      if (isCurrentNodeOutside && isNextNodeOutside) {
        // Add current node
        newPath.add(new Vector(currentNode.x, currentNode.y));
        /** Intersection node between current and next node, this node is guranteed to exist */
        const intersectionNodeA = this.getIntersectionNode(
          currentNode,
          nextNode,
          xMin,
          xMax,
          yMin,
          yMax
        );
        newPath.add(intersectionNodeA);
        newPath.add(null);
        /** Intersection node between next node and newly added intersection node */
        newPath.add(
          this.getIntersectionNode(
            nextNode,
            intersectionNodeA,
            xMin,
            xMax,
            yMin,
            yMax
          )
        );
      } else if (!isCurrentNodeOutside) {
        /* if current node is inside, pick intersection point between next next to current node, as current node is inside */
        newPath.add(
          this.getIntersectionNode(
            nextNode,
            currentNode,
            xMin,
            xMax,
            yMin,
            yMax
          )
        );
      } else if (!isNextNodeOutside) {
        /** if next node inside,
         * pick intersection point between current node to next node,
         * and add null after intersection point, indicating cut  */
        newPath.add(new Vector(currentNode.x, currentNode.y));
        newPath.add(
          this.getIntersectionNode(
            currentNode,
            nextNode,
            xMin,
            xMax,
            yMin,
            yMax
          )
        );
        newPath.add(null);
      } else {
        throw new Error(
          `Unexpected position: current node: (${currentNode.x}, ${currentNode.y}), next node: (${nextNode.x}, ${nextNode.y}), xMin: ${xMin}, xMax: ${xMax}, yMin: ${yMin}, yMax: ${yMax}`
        );
      }

      i++;
      currentNode = this.nodes[i];
      nextNode = this.nodes[i + 1];
    }

    return newPath;
  }

  public setPivot(pivot: Vector) {
    this.pivot = pivot;

    // Update the nodes' positions so they will be relative to a new pivot.
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (!node) continue;

      this.nodes[i] = new Vector(node.x - this.pivot.x, node.y - this.pivot.y);
    }
  }

  public *traverse() {
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const currentNode = this.nodes[i];
      const nextNode = this.nodes[i + 1];

      if (!currentNode || !nextNode) continue;

      yield [currentNode, nextNode];
    }
  }
}
