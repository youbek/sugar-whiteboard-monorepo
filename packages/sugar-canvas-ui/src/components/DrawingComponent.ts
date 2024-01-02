import { MouseEvent } from "../events";
import { ComponentMode, DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";
import { Color, Vector } from "../atoms";
import { Viewport } from "../rendering";

export class DrawingComponent extends RectComponent {
  private isDrawing = false;
  private paths: Vector[] = [];

  public penWidth = 5;
  public penColor = new Color(0, 0, 0, 1);

  constructor() {
    super();

    this.switchToDrawMode();
  }

  private switchToDrawMode() {
    const viewport = Viewport.getCurrentViewport();
    if (!viewport) {
      throw new Error(`Couldn't find viewport!`);
    }

    this.size = new Vector(viewport.canvas.width, viewport.canvas.height);
    this.mode = ComponentMode.EDIT;
    this.zIndex = Number.MAX_SAFE_INTEGER;
  }

  private switchToViewMode() {
    this.zIndex = 1;
    this.isDrawing = false;
    this.mode = ComponentMode.VIEW;
  }

  public draw(context: DrawContext) {
    super.draw(context);

    const prevLineCap = context.ctx.lineCap;
    const prevLineJoin = context.ctx.lineJoin;
    const prevStrokeStyle = context.ctx.strokeStyle;
    const prevLineWidth = context.ctx.lineWidth;

    context.ctx.lineJoin = "round";
    context.ctx.lineCap = "round";
    context.ctx.strokeStyle = this.penColor.toString();
    context.ctx.lineWidth = this.penWidth;
    for (let i = 0; i < this.paths.length - 1; i++) {
      context.ctx.beginPath();
      context.ctx.moveTo(this.paths[i].x, this.paths[i].y);
      context.ctx.lineTo(this.paths[i + 1].x, this.paths[i + 1].y);
      context.ctx.closePath();
      context.ctx.stroke();
    }
    context.ctx.lineJoin = prevLineJoin;
    context.ctx.strokeStyle = prevStrokeStyle;
    context.ctx.lineWidth = prevLineWidth;
    context.ctx.lineCap = prevLineCap;
  }

  public handleMouseDownEvent(event: MouseEvent): void {
    if (this.mode !== ComponentMode.EDIT) return;

    event.stopPropagation();
    this.paths.push(
      new Vector(event.mouseRenderPosition.x, event.mouseRenderPosition.y)
    );
    this.isDrawing = true;
  }

  public handleMouseUpEvent(event: MouseEvent): void {
    if (this.mode !== ComponentMode.EDIT) return;

    event.stopPropagation();
    this.switchToViewMode();
  }

  public handleMouseMoveEvent(event: MouseEvent): void {
    console.log(this.mode, this.isDrawing);

    if (this.mode !== ComponentMode.EDIT || !this.isDrawing) return;

    event.stopPropagation();
    this.paths.push(
      new Vector(event.mouseRenderPosition.x, event.mouseRenderPosition.y)
    );
  }
}
