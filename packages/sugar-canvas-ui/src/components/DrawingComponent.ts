import { MouseEvent } from "../events";
import { ComponentMode, DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";
import { Color, Vector } from "../atoms";
import { Viewport } from "../rendering";

export class DrawingComponent extends RectComponent {
  private isDrawing = false;
  private paths: Vector[] = [];
  private pathBoundary: {
    left: number;
    right: number;
    bottom: number;
    top: number;
  } | null = null;

  public penWidth = 5;
  public penColor = new Color(0, 0, 0, 1);

  constructor() {
    super();

    this.switchToDrawMode();

    this.backgroundColor = new Color(0, 255, 0, 0.5);
  }

  private switchToDrawMode() {
    const viewport = Viewport.getCurrentViewport();
    if (!viewport) {
      throw new Error(`Couldn't find viewport!`);
    }

    this.size = new Vector(viewport.canvas.width, viewport.canvas.height);
    this.mode = ComponentMode.EDIT;
    this.zIndex = Number.MAX_SAFE_INTEGER;
    this.position = viewport.position;
  }

  private switchToViewMode() {
    this.zIndex = 1;
    this.isDrawing = false;
    this.mode = ComponentMode.VIEW;

    if (this.pathBoundary) {
      const x = this.pathBoundary.right - this.pathBoundary.left;
      const y = this.pathBoundary.bottom - this.pathBoundary.top;

      this.size = new Vector(x, y);
      this.position = new Vector(this.pathBoundary.left, this.pathBoundary.top);
    }
  }

  public draw(context: DrawContext) {
    super.draw(context);

    if (this.mode === ComponentMode.EDIT) {
      this.position = context.viewport.position;
    }

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
      const moveToPosition = context.viewport.calculateRenderPosition(
        this.paths[i]
      );
      context.ctx.moveTo(moveToPosition.x, moveToPosition.y);

      const lineToPosition = context.viewport.calculateRenderPosition(
        this.paths[i + 1]
      );
      context.ctx.lineTo(lineToPosition.x, lineToPosition.y);

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
      new Vector(
        event.mouseCanvasPosition.x - this.position.x,
        event.mouseRenderPosition.y - this.position.y
      )
    );
    this.isDrawing = true;
  }

  public handleMouseUpEvent(event: MouseEvent): void {
    if (this.mode !== ComponentMode.EDIT) return;

    event.stopPropagation();
    this.switchToViewMode();
  }

  public handleMouseMoveEvent(event: MouseEvent): void {
    if (this.mode !== ComponentMode.EDIT || !this.isDrawing) return;

    event.stopPropagation();
    const path = new Vector(
      event.mouseCanvasPosition.x - this.position.x,
      event.mouseRenderPosition.y - this.position.y
    );
    this.paths.push(path);

    if (!this.pathBoundary) {
      this.pathBoundary = {
        left: path.x,
        right: path.x,
        top: path.y,
        bottom: path.y,
      };
    } else {
      if (path.x < this.pathBoundary.left) {
        this.pathBoundary.left = path.x;
      }

      if (path.x > this.pathBoundary.right) {
        this.pathBoundary.right = path.x;
      }

      if (path.y > this.pathBoundary.bottom) {
        this.pathBoundary.bottom = path.y;
      }

      if (path.y < this.pathBoundary.top) {
        this.pathBoundary.top = path.y;
      }
    }
  }
}
