import { Vector } from "../atoms";
import { RectComponent } from "./RectComponent";
import { DrawContext } from "./Component";

export class MouseComponent extends RectComponent {
  constructor() {
    super();

    this.size = new Vector(10, 10);
  }

  public draw(context: DrawContext): void {
    const renderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    context.ctx.fillStyle = "red";
    context.ctx.fillRect(
      renderPosition.x,
      renderPosition.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );

    super.draw(context);
  }
}
