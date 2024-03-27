import { MouseEvent, Vector, DrawingComponent } from "sugar-canvas-ui";
import { Controller } from "./Controller";

export class DrawController extends Controller {
  private drawingComponent: DrawingComponent | null = null;

  constructor() {
    super();
  }

  public handleMouseDownEvent(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.drawingComponent) {
      this.drawingComponent = new DrawingComponent();
      this.drawingComponent.switchToDrawMode();
      this.componentsTree.addComponent(this.drawingComponent);
    }

    this.drawingComponent.addPathNode(
      new Vector(event.mouseCanvasPosition.x, event.mouseCanvasPosition.y)
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
      event.mouseCanvasPosition.x,
      event.mouseCanvasPosition.y
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
}
