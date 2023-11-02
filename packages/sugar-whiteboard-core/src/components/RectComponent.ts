import { Color } from "../atoms/Color";
import { Component, DrawContext } from "./Component";

export class RectComponent extends Component {
  public color: Color = new Color(0, 0, 0, 0);
  public backgroundColor: Color = new Color(0, 0, 0, 0);

  public draw(context: DrawContext): void {
    context.ctx.fillStyle = this.backgroundColor.toString();
    const renderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    context.ctx.fillRect(
      renderPosition.x,
      renderPosition.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );
  }
}
