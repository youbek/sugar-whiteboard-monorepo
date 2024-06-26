import {
  MouseEvent,
  Vector,
  DrawingComponent,
  MouseComponent,
  MouseImagePivot,
} from "sugar-canvas-ui";
import penIcon from "../assets/icons/pen.svg";
import { Controller } from "./Controller";

export class DrawController extends Controller {
  private drawingComponent: DrawingComponent | null = null;

  constructor() {
    super();

    const mouseComponent = MouseComponent.getCurrentMouse();

    mouseComponent.setImage(penIcon, MouseImagePivot.BOTTOM_LEFT);
  }

  public handleMouseDownEvent(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.drawingComponent) {
      this.drawingComponent = new DrawingComponent();
      this.drawingComponent.switchToDrawMode();
      this.componentsTree.addComponent(this.drawingComponent);
    }

    this.drawingComponent.addPathNode(
      new Vector(event.mouseRenderPosition.x, event.mouseRenderPosition.y)
    );
  }

  public handleMouseUpEvent(event: MouseEvent): void {
    event.stopPropagation();

    this.drawingComponent?.switchToViewMode();

    const addedDrawingComponent = this.drawingComponent || null;
    this.drawingComponent = null;

    this.undoRedoContainer.saveUndoRedoActions(
      ({ componentsTree }) => {
        if (addedDrawingComponent)
          componentsTree.removeComponent(addedDrawingComponent);
      },
      ({ componentsTree }) => {
        if (addedDrawingComponent)
          componentsTree.addComponent(addedDrawingComponent);
      }
    );
  }

  public handleMouseMoveEvent(event: MouseEvent): void {
    if (!this.drawingComponent) return;

    const node = new Vector(
      event.mouseRenderPosition.x,
      event.mouseRenderPosition.y
    );
    this.drawingComponent.addPathNode(node);
  }

  public mount(): void {
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mousedown",
        this.handleMouseDownEvent.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mouseup",
        this.handleMouseUpEvent.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mousemove",
        this.handleMouseMoveEvent.bind(this)
      )
    );
  }

  public unmount(): void {
    super.unmount();

    MouseComponent.getCurrentMouse().removeImage(penIcon);
  }
}
