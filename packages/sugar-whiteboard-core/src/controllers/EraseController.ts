import {
  MouseEvent,
  Vector,
  DrawingComponent,
  MouseComponent,
} from "sugar-canvas-ui";
import eraseIcon from "../assets/icons/erase.svg";

import { Controller } from "./Controller";

export class EraseController extends Controller {
  public eraseArea: Vector = new Vector(24, 24);
  public currentDrawings: DrawingComponent[] = [];
  public isErasing: boolean = false;

  constructor() {
    super();

    const mouseComponent = MouseComponent.getCurrentMouse();

    mouseComponent.setImage(eraseIcon);
    mouseComponent.size = this.eraseArea;
    document.body.style.cursor = "none";
  }

  public handleMouseDownEvent(event: MouseEvent): void {
    event.stopPropagation();

    this.currentDrawings =
      this.componentsTree.findComponentsOfType(DrawingComponent);

    if (this.currentDrawings.length) {
      this.isErasing = true;

      for (const component of this.currentDrawings) {
        component.removePathNodes(
          new Vector(
            // TODO: Remove calculation
            event.mouseRenderPosition.x,
            event.mouseRenderPosition.y
          ),
          this.eraseArea
        );
      }
    }
  }

  public handleMouseMoveEvent(event: MouseEvent) {
    if (this.isErasing) {
      for (const component of this.currentDrawings) {
        component.removePathNodes(
          new Vector(
            // TODO: Remove calculation
            event.mouseRenderPosition.x,
            event.mouseRenderPosition.y
          ),
          this.eraseArea
        );
      }
    }
  }

  public handleMouseUpEvent(event: MouseEvent) {
    event.stopPropagation();

    /** Find DrawingComponents that has size equal to zero, remove them from tree! */
    for (const component of this.currentDrawings) {
      if (component.size.x <= 0 || component.size.y <= 0) {
        this.componentsTree.removeComponent(component);
      }
    }

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

    document.body.style.cursor = "default";
    MouseComponent.getCurrentMouse().removeImage(eraseIcon);
  }
}
