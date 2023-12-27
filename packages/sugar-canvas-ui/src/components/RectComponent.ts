import { Color, Vector } from "../atoms";
import { Component, DrawContext } from "./Component";
import { Draggable } from "../decorators";

@Draggable()
export class RectComponent extends Component {
  public color: Color = new Color(0, 0, 0, 0);
  public backgroundColor: Color = new Color(0, 0, 0, 0);

  public get vertices() {
    return [
      new Vector(this.lastRenderPosition.x, this.lastRenderPosition.y),
      new Vector(
        this.lastRenderPosition.x + this.size.x,
        this.lastRenderPosition.y
      ),
      new Vector(
        this.lastRenderPosition.x + this.size.x,
        this.lastRenderPosition.y + this.size.y
      ),
      new Vector(
        this.lastRenderPosition.x,
        this.lastRenderPosition.y + this.size.y
      ),
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
    context.ctx.fillStyle = this.backgroundColor.toString();
    this.lastRenderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    context.ctx.fillRect(
      this.lastRenderPosition.x,
      this.lastRenderPosition.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );

    super.draw(context);
  }
}
