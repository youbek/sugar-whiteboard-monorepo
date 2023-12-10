import { Vector } from "../../atoms";
import { FollowMousePosition } from "../decorators/FollowMousePosition";
import { ComponentsTree } from "../rendering";
import { Component, DrawContext } from "./Component";

@FollowMousePosition()
export class MouseComponent extends Component {
  private static currentMouse: MouseComponent;

  constructor() {
    super();

    if (MouseComponent.currentMouse) {
      throw new Error(
        "Cannot initialize another MouseComponent, it already exists."
      );
    }

    this.size = new Vector(10, 10);
    MouseComponent.currentMouse = this;
  }

  public get vertices() {
    return [
      new Vector(this.position.x, this.position.y),
      new Vector(this.position.x + this.size.x, this.position.y),
      new Vector(this.position.x + this.size.x, this.position.y + this.size.y),
      new Vector(this.position.x, this.position.y + this.size.y),
    ];
  }

  public get edges() {
    return [
      Vector.from([this.vertices[0], this.vertices[1]]),
      Vector.from([this.vertices[1], this.vertices[2]]),
      Vector.from([this.vertices[2], this.vertices[3]]),
      Vector.from([this.vertices[3], this.vertices[0]]),
    ];
  }

  public isColliding(other: Component) {
    const componentsTree = ComponentsTree.getCurrentComponentsTree();
    const isCollidingWithOtherComponent = super.isColliding(other);

    if (!isCollidingWithOtherComponent) return false;

    const otherComponentIndexInTree = componentsTree.getIndex(other);

    const higherZIndexCollidingComponent = componentsTree
      .getComponents()
      .find(
        (component, index) =>
          component.id !== other.id &&
          component.id !== this.id &&
          (component.zIndex > other.zIndex ||
            (component.zIndex === other.zIndex &&
              index > otherComponentIndexInTree)) &&
          super.isColliding(component)
      );

    if (higherZIndexCollidingComponent) return false;

    return true;
  }

  public draw(context: DrawContext): void {
    context.ctx.fillStyle = "red";
    context.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );
  }

  public static getCurrentMouse() {
    return MouseComponent.currentMouse;
  }
}
