import { Vector } from "../../atoms";
import { RectComponent } from "./RectComponent";
import { DrawContext } from "./Component";

export class MouseComponent extends RectComponent {
  constructor() {
    super();

    this.size = new Vector(10, 10);
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
    context.ctx.fillStyle = "red";
    context.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );

    super.draw(context);
  }
}
