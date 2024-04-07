import {
  MouseEvent,
  Vector,
  DrawingComponent,
  MouseComponent,
} from "sugar-canvas-ui";
import eraseIcon from "../assets/icons/erase.svg";

import { Controller } from "./Controller";

type DrawingPathChanges = {
  oldDrawing: DrawingComponent;
  newDrawing: DrawingComponent;
};

export class EraseController extends Controller {
  public eraseArea: Vector = new Vector(24, 24);
  public currentDrawings: DrawingComponent[] = [];
  public isErasing: boolean = false;

  // Drawing component id and it is old version that contains old path and new version that contains new path
  private erasedDrawings: Map<string, DrawingPathChanges> = new Map();

  constructor() {
    super();

    const mouseComponent = MouseComponent.getCurrentMouse();

    mouseComponent.setImage(eraseIcon);
    mouseComponent.size = this.eraseArea;
  }

  public cacheDrawingEraseChanges(component: DrawingComponent) {
    this.erasedDrawings.set(component.id, {
      oldDrawing:
        this.erasedDrawings.get(component.id)?.oldDrawing ??
        component.duplicate(),
      newDrawing: component.duplicate(),
    });
  }

  public eraseFromCurrentDrawings(event: MouseEvent) {
    if (this.currentDrawings.length) {
      this.isErasing = true;

      for (const component of this.currentDrawings) {
        this.cacheDrawingEraseChanges(component);

        component.removePathNodes(
          new Vector(
            // TODO: Remove calculation
            event.mouseRenderPosition.x,
            event.mouseRenderPosition.y
          ),
          this.eraseArea
        );

        this.cacheDrawingEraseChanges(component);
      }
    } else {
      this.isErasing = false;
    }
  }

  public handleMouseDownEvent(event: MouseEvent): void {
    event.stopPropagation();

    // Set current drawings for erase
    this.currentDrawings =
      this.componentsTree.findComponentsOfType(DrawingComponent);

    this.erasedDrawings = new Map();

    this.eraseFromCurrentDrawings(event);
  }

  public handleMouseMoveEvent(event: MouseEvent) {
    this.eraseFromCurrentDrawings(event);
  }

  public handleMouseUpEvent(event: MouseEvent) {
    event.stopPropagation();

    // Set current drawings for erase to empty so that erase stops
    this.currentDrawings = [];

    const deletedDrawingIds = this.currentDrawings.reduce<string[]>(
      (deletedDrawings, drawing) => {
        /** Find DrawingComponents that has size equal to zero, remove them from tree! */
        if (drawing.size.x <= 0 || drawing.size.y <= 0) {
          this.componentsTree.removeComponent(drawing);
          deletedDrawings.push(drawing.id);
        }

        return deletedDrawings;
      },
      []
    );

    // this is to make sure we don't keep EraseController in the heap
    const erasedDrawings = this.erasedDrawings;

    this.undoRedoContainer.saveUndoRedoActions(
      ({ componentsTree }) => {
        // Restore erased drawings
        for (const [drawingId, { oldDrawing }] of erasedDrawings) {
          let drawingComponent =
            componentsTree.findComponentById<DrawingComponent>(drawingId);

          // Restore deleted drawings
          if (!drawingComponent) {
            drawingComponent = new DrawingComponent();
            componentsTree.addComponent(drawingComponent);
          } else {
            componentsTree.removeComponent(drawingComponent);
            componentsTree.addComponent(oldDrawing);
          }
        }
      },
      ({ componentsTree }) => {
        // Redo erasing
        for (const [drawingId, { newDrawing }] of erasedDrawings) {
          let drawingComponent =
            componentsTree.findComponentById<DrawingComponent>(drawingId);

          if (!drawingComponent) {
            // this case should not actually happen but it is here for any case
            drawingComponent = new DrawingComponent();
            componentsTree.addComponent(drawingComponent);
          } else if (deletedDrawingIds.includes(drawingId)) {
            componentsTree.removeComponent(drawingComponent);
          } else {
            componentsTree.removeComponent(drawingComponent);
            componentsTree.addComponent(newDrawing);
          }
        }
      }
    );

    this.isErasing = false;
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
        "mousemove",
        this.handleMouseMoveEvent.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mouseup",
        this.handleMouseUpEvent.bind(this)
      )
    );
  }

  public unmount(): void {
    super.unmount();

    MouseComponent.getCurrentMouse().removeImage(eraseIcon);
  }
}
