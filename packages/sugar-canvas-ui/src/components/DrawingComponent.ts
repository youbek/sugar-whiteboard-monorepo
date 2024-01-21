import { MouseEvent } from "../events";
import { ComponentMode, DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";
import { Color, Vector, Path } from "../atoms";
import { Viewport } from "../rendering";

export class DrawingComponent extends RectComponent {
  private isDrawing = false;
  private path: Path = new Path();
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

      const pivot = new Vector(this.pathBoundary.left, this.pathBoundary.top);

      this.position = new Vector(
        pivot.x + this.position.x,
        pivot.y + this.position.y
      );

      this.path.setPivot(pivot);
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

    for (const [currentNode, nextNode] of this.path.traverse()) {
      context.ctx.beginPath();
      const moveToPosition = context.viewport.calculateRenderPosition(
        new Vector(
          currentNode.x + this.position.x,
          currentNode.y + this.position.y
        )
      );
      context.ctx.moveTo(moveToPosition.x, moveToPosition.y);

      const lineToPosition = context.viewport.calculateRenderPosition(nextNode);
      context.ctx.lineTo(
        lineToPosition.x + this.position.x,
        lineToPosition.y + this.position.y
      );

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
    this.path.add(
      new Vector(event.mouseCanvasPosition.x, event.mouseCanvasPosition.y)
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
    const node = new Vector(
      event.mouseCanvasPosition.x,
      event.mouseCanvasPosition.y
    );
    this.path.add(node);

    if (!this.pathBoundary) {
      this.pathBoundary = {
        left: node.x,
        right: node.x,
        top: node.y,
        bottom: node.y,
      };
    } else {
      if (node.x < this.pathBoundary.left) {
        this.pathBoundary.left = node.x;
      }

      if (node.x > this.pathBoundary.right) {
        this.pathBoundary.right = node.x;
      }

      if (node.y > this.pathBoundary.bottom) {
        this.pathBoundary.bottom = node.y;
      }

      if (node.y < this.pathBoundary.top) {
        this.pathBoundary.top = node.y;
      }
    }
  }
}
