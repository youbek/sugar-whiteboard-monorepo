import { Vector, Viewport, Component, DrawContext } from "sugar-canvas-ui";

export class MainBoardComponent extends Component {
  public zIndex = Number.MIN_SAFE_INTEGER;
  public gridSize = new Vector(100, 100);

  public get vertices(): Vector[] {
    const viewport = Viewport.getCurrentViewport();
    const position = viewport.calculateRenderPosition(this.getPosition());
    const size = this.getSize();

    return [
      new Vector(position.x, position.y),
      new Vector(position.x + size.x, position.y),
      new Vector(position.x + size.x, position.y + size.y),
      new Vector(position.x, position.y + size.y),
    ];
  }

  public get edges(): Vector[] {
    return [
      Vector.from([this.vertices[0], this.vertices[1]]),
      Vector.from([this.vertices[1], this.vertices[2]]),
      Vector.from([this.vertices[2], this.vertices[3]]),
      Vector.from([this.vertices[3], this.vertices[0]]),
    ];
  }

  private drawBackground(context: DrawContext) {
    const size = this.getSize();

    context.ctx.fillStyle = "#F3F3F3";
    context.ctx.fillRect(0, 0, size.x, size.y);
  }

  private drawGrid(context: DrawContext) {
    let pivot = new Vector(
      context.viewport.bounds.left,
      context.viewport.bounds.top
    );
    let shouldDrawHorizontalLine = false;
    let shouldDrawVerticalLine = false;
    let oldStrokeStyle = context.ctx.strokeStyle;
    do {
      shouldDrawHorizontalLine = pivot.x < context.viewport.bounds.right;
      if (shouldDrawHorizontalLine) {
        context.ctx.beginPath();
        const fromPosition = context.viewport.calculateRenderPosition(
          new Vector(pivot.x, context.viewport.bounds.top)
        );
        const toPosition = context.viewport.calculateRenderPosition(
          new Vector(pivot.x, context.viewport.bounds.bottom)
        );
        context.ctx.moveTo(fromPosition.x, fromPosition.y);
        context.ctx.lineTo(toPosition.x, toPosition.y);
        context.ctx.strokeStyle = "#E8E8E8";
        context.ctx.stroke();
      }

      shouldDrawVerticalLine = pivot.y < context.viewport.bounds.bottom;
      if (shouldDrawVerticalLine) {
        context.ctx.beginPath();
        const fromPosition = context.viewport.calculateRenderPosition(
          new Vector(context.viewport.bounds.left, pivot.y)
        );
        const toPosition = context.viewport.calculateRenderPosition(
          new Vector(context.viewport.bounds.right, pivot.y)
        );
        context.ctx.moveTo(fromPosition.x, fromPosition.y);
        context.ctx.lineTo(toPosition.x, toPosition.y);
        context.ctx.strokeStyle = "#E8E8E8";
        context.ctx.stroke();
      }

      pivot = new Vector(pivot.x + this.gridSize.x, pivot.y + this.gridSize.y);
    } while (shouldDrawHorizontalLine || shouldDrawVerticalLine);
    context.ctx.strokeStyle = oldStrokeStyle;
  }

  public getSize() {
    const viewport = Viewport.getCurrentViewport();

    return new Vector(viewport.canvas.width, viewport.canvas.height);
  }

  public getPosition() {
    const viewport = Viewport.getCurrentViewport();

    return viewport.getPosition();
  }

  public setPosition(position: Vector): void {
    const viewport = Viewport.getCurrentViewport();
    viewport.setPosition(position);
  }

  public draw(context: DrawContext): void {
    this.drawBackground(context);
    this.drawGrid(context);

    super.draw(context);
  }
}
