import { Color, Vector } from "../atoms";
import { Component, DrawContext } from "./Component";

export class RectComponent extends Component {
  public color: Color = new Color(0, 0, 0, 0);
  public backgroundColor: Color = new Color(0, 0, 0, 0);

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

    context.ctx.fillStyle = this.backgroundColor.toString();

    context.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );
  }
}
