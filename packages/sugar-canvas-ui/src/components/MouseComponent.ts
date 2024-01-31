import { Vector } from "../atoms";
import { Component, DrawContext } from "./Component";
import { Viewport } from "../rendering";
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

    this.syncMousePosition();
  }

  private syncMousePosition() {
    const viewport = Viewport.getCurrentViewport();
    viewport.canvas.addEventListener("mousemove", (domEvent) => {
      const rect = viewport.canvas.getBoundingClientRect();
      const mouseCanvasPosition = new Vector(
        domEvent.clientX - rect.left,
        domEvent.clientY - rect.top
      );

      this.setPosition(mouseCanvasPosition);
    });
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

  public draw(context: DrawContext): void {
    super.draw(context);

    // UNCOMMENT TO SEE DEBUG RENDER
    // context.ctx.fillStyle = "red";
    // context.ctx.fillRect(
    //   this.position.x,
    //   this.position.y,
    //   this.size.x * this.scale,
    //   this.size.y * this.scale
    // );
  }

  public static getCurrentMouse() {
    return MouseComponent.currentMouse;
  }
}
