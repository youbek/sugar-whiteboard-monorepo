import { Vector } from "../../atoms";
import { Component, DrawContext } from "./Component";

export class ViewportBackgroundComponent extends Component {
  public gridSize = new Vector(100, 100);

  constructor() {
    super({
      isDraggable: false,
    });
  }

  private drawBackground(context: DrawContext) {
    context.ctx.fillStyle = "#F3F3F3";
    context.ctx.fillRect(
      0,
      0,
      context.viewport.size.x,
      context.viewport.size.y
    );
  }

  private drawGrid(context: DrawContext) {
    let pivot = context.viewport.calculateRenderPosition(
      new Vector(context.viewport.bounds.left, context.viewport.bounds.top)
    );
    let shouldDrawHorizontalLine = false;
    let shouldDrawVerticalLine = false;
    let oldStrokeStyle = context.ctx.strokeStyle;
    do {
      shouldDrawHorizontalLine = pivot.x < context.viewport.bounds.right;
      if (shouldDrawHorizontalLine) {
        context.ctx.beginPath();
        context.ctx.moveTo(context.viewport.bounds.left, pivot.y);
        context.ctx.lineTo(context.viewport.bounds.right, pivot.y);
        context.ctx.strokeStyle = "#E8E8E8";
        context.ctx.stroke();
      }

      shouldDrawVerticalLine = pivot.y < context.viewport.bounds.bottom;
      if (shouldDrawVerticalLine) {
        context.ctx.beginPath();
        context.ctx.moveTo(pivot.x, context.viewport.bounds.top);
        context.ctx.lineTo(pivot.x, context.viewport.bounds.bottom);
        context.ctx.strokeStyle = "#E8E8E8";
        context.ctx.stroke();
      }

      pivot = new Vector(pivot.x + this.gridSize.x, pivot.y + this.gridSize.y);
    } while (shouldDrawHorizontalLine || shouldDrawVerticalLine);

    context.ctx.strokeStyle = oldStrokeStyle;
  }

  public isColliding(other: Component): boolean {
    return false;
  }

  public onMouseOver(): void {}

  public onMouseOut(): void {}

  public draw(context: DrawContext): void {
    this.drawBackground(context);
    this.drawGrid(context);
  }
}
