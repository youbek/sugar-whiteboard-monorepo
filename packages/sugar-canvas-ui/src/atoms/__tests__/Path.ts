import { Path } from "../Path";
import { Vector } from "../Vector";

describe("Path", () => {
  test("Drawing: should add new node", () => {
    const path = new Path({ minSpaceBetweenNodes: 0 });

    path.add(new Vector(0, 0));
    path.add(new Vector(1, 1));

    const traverse = path.traverse();

    let next = traverse.next();
    expect(Array.isArray(next.value)).toBe(true);
    expect(next.value as unknown as Vector[]).toHaveLength(2);

    next = traverse.next();
    expect(next.done).toBe(true);
  });

  test("Erasing: remove nodes in the area, and also auto create new nodes that partially overlaps with the given area", () => {
    const path = new Path({ minSpaceBetweenNodes: 0 });

    // drawing path on 10x10 grid
    path.add(new Vector(0, 3)); // Node A
    path.add(new Vector(10, 3)); // Node B
    path.add(new Vector(10, 9)); // Node C
    path.add(new Vector(4, 10)); // Node D
    path.add(new Vector(4, 1)); // Node E
    path.add(new Vector(6, 2)); // Node F

    // Area that partially removes/disconnects nodes at (A, B, D, E, F);
    const areaSize = new Vector(4, 4);
    const areaPosition = new Vector(3, 0);

    const newPath = path.remove(areaPosition, areaSize);

    const nodes = newPath.getAllNodes();

    // this is because E->F where within the remove area, they deleted
    // for other nodes we will create new nodes at the point of intersaction with the area
    const expectedNodes = [
      new Vector(0, 3),
      new Vector(3, 3),
      null, // removed space that was between A and B nodes!
      new Vector(7, 3),
      new Vector(10, 3),
      new Vector(10, 9),
      new Vector(4, 10),
      new Vector(4, 4),
      null,
    ];

    console.log(nodes);
    expect(nodes).toHaveLength(expectedNodes.length);
    for (let i = 0; i < expectedNodes.length; i++) {
      const node = nodes[i];
      const expectedNode = expectedNodes[i];

      if (!node || !expectedNode) {
        expect(node).toBe(expectedNode);
      } else {
        expect(node.x).toBe(expectedNode.x);
        expect(node.y).toBe(expectedNode.y);
      }
    }
  });

  test("Erasing: remove nodes in the area from left to right, and also auto create new nodes along the way", () => {
    let path = new Path({ minSpaceBetweenNodes: 0 });

    // drawing path from left to right
    path.add(new Vector(10, 2)); // Node A
    path.add(new Vector(20, 4)); // Node B
    path.add(new Vector(30, 6)); // Node C

    // Area is not within the path so it should not remove anything
    const areaSize = new Vector(4, 20);
    let areaPosition = new Vector(0, 0);

    let oldNodes = path.getAllNodes();

    path.remove(areaPosition, areaSize);

    let nodes = path.getAllNodes();

    expect(nodes).toHaveLength(oldNodes.length);

    oldNodes.forEach((oldNode, index) => {
      expect(nodes[index]?.x).toBe(oldNode?.x);
      expect(nodes[index]?.y).toBe(oldNode?.y);
    });

    // Area is within the path so it should remove the left node
    // And create new node right after the area ending

    // Remove Node A -> create new Node
    areaPosition = new Vector(7, areaPosition.y);

    oldNodes = path.getAllNodes();
    path = path.remove(areaPosition, areaSize);
    nodes = path.getAllNodes();

    expect(nodes).toHaveLength(oldNodes.length);
    expect(nodes[0]?.x).toBe(11); // areaPosition.x (7) + areaSize.x (4) => 11
  });

  test("Erarsing: remove nodes in the area from bottom to top, and also auto create new nodes along the way", () => {
    const path = new Path({ minSpaceBetweenNodes: 0 });

    // drawing path from left to right
    path.add(new Vector(12, 10)); // Node A
    path.add(new Vector(10, 50)); // Node B
    path.add(new Vector(14, 100)); // Node C
    path.add(new Vector(11, 200)); // Node D
    path.add(new Vector(15, 300)); // Node E

    // Area is not within the path so it should not remove anything
    const areaSize = new Vector(20, 10);
    let areaPosition = new Vector(10, 0);

    let newPath = path.remove(areaPosition, areaSize);

    let oldNodes = path.getAllNodes();
    let nodes = newPath.getAllNodes();

    expect(nodes).toHaveLength(oldNodes.length);

    oldNodes.forEach((oldNode, index) => {
      expect(nodes[index]?.x).toBe(oldNode?.x);
      expect(nodes[index]?.y).toBe(oldNode?.y);
    });

    // Area is within the path so it should remove the left node
    // And create new node right after the area ending
    areaPosition = new Vector(areaPosition.x, areaPosition.y + 5);

    newPath = path.remove(areaPosition, areaSize);

    oldNodes = path.getAllNodes();
    nodes = newPath.getAllNodes();

    expect(nodes).toHaveLength(oldNodes.length);
    expect(nodes[0]?.y).toBe(areaPosition.y + areaSize.y); // 0 + 5 + 10 => 15
  });

  test("Erasing: remove area in the middle of 2 points, and also auto create new nodes", () => {
    const path = new Path({ minSpaceBetweenNodes: 0 });

    // drawing path from left to right
    path.add(new Vector(10, 4)); // Node A
    path.add(new Vector(30, 4)); // Node B

    const areaSize = new Vector(4, 20);
    let areaPosition = new Vector(15, 0);

    let newPath = path.remove(areaPosition, areaSize);

    let oldNodes = path.getAllNodes();
    let nodes = newPath.getAllNodes();

    expect(nodes).not.toHaveLength(oldNodes.length);

    const expectedNodes = [
      new Vector(10, 4),
      new Vector(15, 4),
      null,
      new Vector(19, 4),
      new Vector(30, 4),
    ];

    expect(nodes).toHaveLength(expectedNodes.length);

    for (let i = 0; i < expectedNodes.length; i++) {
      const node = nodes[i];
      const expectedNode = expectedNodes[i];

      if (!node || !expectedNode) {
        expect(node).toBe(expectedNode);
      } else {
        expect(node.x).toBe(expectedNode.x);
        expect(node.y).toBe(expectedNode.y);
      }
    }
  });
});
