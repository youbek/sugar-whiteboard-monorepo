import { Color, Path, Vector } from "../atoms";
import { RectComponent } from "./RectComponent";
import { ComponentMode, DrawContext } from "./Component";
import { Viewport } from "../rendering";
export class DrawingComponent extends RectComponent {
  public path: Path = new Path();
  public penWidth = 5;
  public penColor = new Color(0, 0, 0, 1);

  constructor() {
    super();
  }

  public duplicate(): DrawingComponent {
    const duplicateDrawing = new DrawingComponent();
    duplicateDrawing.id = this.id;
    duplicateDrawing.position = this.position;
    duplicateDrawing.rotation = this.rotation;
    duplicateDrawing.path = this.path;
    duplicateDrawing.size = this.size;
    duplicateDrawing.pivot = this.pivot;

    return duplicateDrawing;
  }

  public draw(context: DrawContext) {
    super.draw(context);

    if (this.mode === ComponentMode.EDIT) {
      this.position = new Vector(
        context.viewport.position.x,
        context.viewport.position.y
      );
      this.size = context.viewport.size;
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
      const moveToPosition = new Vector(currentNode.x, currentNode.y);
      context.ctx.moveTo(moveToPosition.x, moveToPosition.y);

      const lineToPosition = new Vector(nextNode.x, nextNode.y);

      context.ctx.lineTo(lineToPosition.x, lineToPosition.y);

      context.ctx.closePath();
      context.ctx.stroke();
    }

    context.ctx.lineJoin = prevLineJoin;
    context.ctx.strokeStyle = prevStrokeStyle;
    context.ctx.lineWidth = prevLineWidth;
    context.ctx.lineCap = prevLineCap;
  }

  public addPathNode(node: Vector) {
    this.path.add(node);
  }

  public removePathNodes(position: Vector, area: Vector) {
    const newPath = this.path.remove(position, area);

    this.path = newPath;
    this.recalculatePosition();
    this.recalculateSize();
  }

  public switchToDrawMode() {
    const viewport = Viewport.getCurrentViewport();
    if (!viewport) {
      throw new Error(`Couldn't find viewport!`);
    }

    this.setMode(ComponentMode.EDIT);
    this.zIndex = Number.MAX_SAFE_INTEGER;
    this.position = viewport.position;
  }

  public switchToViewMode() {
    this.zIndex = 1;
    this.removeMode(ComponentMode.EDIT);

    this.recalculatePosition();
    this.recalculateSize();
  }

  // THIS CAN POSSIBLY BE REFACTORED!!!
  public recalculatePosition() {
    const pathPosition = this.path.getPosition();

    this.position = new Vector(pathPosition.x, pathPosition.y);
  }

  public recalculateSize() {
    this.size = this.path.getSize();
  }

  public setPosition(newPosition: Vector): void {
    this.path.setPosition(newPosition);

    this.position = new Vector(newPosition.x, newPosition.y);
  }
}
