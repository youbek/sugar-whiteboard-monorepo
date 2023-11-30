/**
 * ==============================
 * Handles all events made to the
 * canvas and calculates which
 * components should recieve the
 * event
 * ==============================
 */

import { Vector } from "../../atoms";
import { MouseComponent } from "../components";
import { ComponentsTree, Viewport } from "../rendering";

export class EventManager {
  private canvas: HTMLCanvasElement;
  private shadowMouseComponent: MouseComponent;
  private componentsTree: ComponentsTree;
  private viewport: Viewport;

  constructor(
    canvas: HTMLCanvasElement,
    mouseComponent: MouseComponent,
    componentsTree: ComponentsTree,
    viewport: Viewport
  ) {
    this.canvas = canvas;
    this.shadowMouseComponent = mouseComponent;
    this.componentsTree = componentsTree;
    this.viewport = viewport;

    this.canvas.addEventListener(
      "mousemove",
      this.handleMouseOnEvent.bind(this)
    );
  }

  private handleMouseOnEvent(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mousePosition = new Vector(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    this.shadowMouseComponent?.setPosition(
      this.viewport.calculateRenderPosition(mousePosition)
    );

    for (const component of this.componentsTree.getComponents()) {
      if (component.isColliding(this.shadowMouseComponent)) {
        component.mouseOver.next(undefined);
      } else {
        component.mouseOut.next(undefined);
      }
    }
  }
}
