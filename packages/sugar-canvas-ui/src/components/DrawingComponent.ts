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

      const lineToPosition = context.viewport.calculateRenderPosition(
        new Vector(nextNode.x + this.position.x, nextNode.y + this.position.y)
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

  public addPathNode(node: Vector) {
    this.path.add(node);
  }

  public removePathNodes(position: Vector, area: Vector) {
    const localPosition = new Vector(
      position.x - this.position.x,
      position.y - this.position.y
    );
    const newPath = this.path.remove(localPosition, area);

    this.path = newPath;
    this.recalculatePosition();
    this.recalculateSize();
  }

  public switchToDrawMode() {
    const viewport = Viewport.getCurrentViewport();
    if (!viewport) {
      throw new Error(`Couldn't find viewport!`);
    }

    this.size = new Vector(viewport.canvas.width, viewport.canvas.height);
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

  public recalculatePosition() {
    // this gives left top node's position. Which is canvas position.
    // So, no matter where this drawing component is, in other words no matter where the viewport is
    // max left top node's position is (0, 0) indicating the corner of the screen.
    const pathPosition = this.path.getPosition();

    // Now we need to add this.position to keep position within the viewport's position
    // otherwise everything will swap back to the origin as path position is canvas position
    this.position = new Vector(
      pathPosition.x + this.position.x,
      pathPosition.y + this.position.y
    );

    // Why? - Because node's position should be always local. And left top node should be at (0, 0) position.
    // In other words we need to set new pivot.
    this.path.setPivot(pathPosition);
  }

  public recalculateSize() {
    this.size = this.path.getSize();
  }
}
