import { Path } from "../Path";
import { Vector } from "../Vector";

describe("Path", () => {
  it("Drawing: should add new node", () => {
    const path = new Path();

    path.add(new Vector(0, 0));
    path.add(new Vector(1, 1));

    const traverse = path.traverse();

    let next = traverse.next();
    expect(Array.isArray(next.value)).toBe(true);
    expect(next.value as unknown as Vector[]).toHaveLength(2);

    next = traverse.next();
    expect(next.done).toBe(true);
  });

  it("Erasing: remove nodes in the area, and also auto create new nodes that partially overlaps with the given area", () => {
    const path = new Path();

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

    path.remove(areaPosition, areaSize);

    const nodes = path.getAllNodes();

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

    expect(nodes).toHaveLength(expectedNodes.length);
    for (let i = 0; i < expectedNodes.length; i++) {
      const node = nodes[i];
      const expectedNode = nodes[i];
      expect(node.x).toBe(expectedNode.x);
      expect(node.y).toBe(expectedNode.y);
    }
  });
});
