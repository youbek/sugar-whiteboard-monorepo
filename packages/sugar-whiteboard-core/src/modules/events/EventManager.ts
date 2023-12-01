/**
 * ==============================
 * Handles all events made to the
 * canvas and calculates which
 * components should recieve the
 * event
 * ==============================
 */

import { Vector } from "../../atoms";
import { Component, MouseComponent } from "../components";
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

    this.checkForMouseClickEvent();
    this.checkForMouseOnEvent();
    this.checkForMouseDragEvents();
  }

  private checkForMouseClickEvent() {
    this.canvas.addEventListener("click", (event) => {
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
          component.mouseClick.next(undefined);
        }
      }
    });
  }

  private checkForMouseOnEvent() {
    this.canvas.addEventListener("mousemove", (event) => {
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
    });
  }

  private checkForMouseDragEvents() {
    let prevWaitTimerId: any = undefined;
    let draggingComponent: Component | undefined;
    let cursorStyle = this.canvas.style.cursor;

    this.canvas.addEventListener("mousedown", (event) => {
      if (!!prevWaitTimerId) {
        clearTimeout(prevWaitTimerId);
      }

      prevWaitTimerId = setTimeout(() => {
        const rect = this.canvas.getBoundingClientRect();
        const mousePosition = new Vector(
          event.clientX - rect.left,
          event.clientY - rect.top
        );

        const mouseRenderPosition =
          this.viewport.calculateRenderPosition(mousePosition);

        this.shadowMouseComponent?.setPosition(mouseRenderPosition);

        draggingComponent = this.componentsTree
          .getComponents()
          .find((component) =>
            component.isColliding(this.shadowMouseComponent)
          );

        draggingComponent?.mouseDragStart.next({
          mouseX: mousePosition.x,
          mouseY: mousePosition.y,
          mouseXRelativeToViewport: mouseRenderPosition.x,
          mouseYRelativeToViewport: mouseRenderPosition.y,
        });

        if (draggingComponent) {
          this.canvas.style.cursor = "grab";
        }
      }, 100);
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (draggingComponent) {
        const rect = this.canvas.getBoundingClientRect();
        const mousePosition = new Vector(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
        const mouseRenderPosition =
          this.viewport.calculateRenderPosition(mousePosition);

        draggingComponent.mouseDrag.next({
          mouseX: mousePosition.x,
          mouseY: mousePosition.y,
          mouseXRelativeToViewport: mouseRenderPosition.x,
          mouseYRelativeToViewport: mouseRenderPosition.y,
        });
      }
    });

    this.canvas.addEventListener("mouseup", (event) => {
      if (draggingComponent) {
        const rect = this.canvas.getBoundingClientRect();
        const mousePosition = new Vector(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
        const mouseRenderPosition =
          this.viewport.calculateRenderPosition(mousePosition);

        draggingComponent.mouseDragEnd.next({
          mouseX: mousePosition.x,
          mouseY: mousePosition.y,
          mouseXRelativeToViewport: mouseRenderPosition.x,
          mouseYRelativeToViewport: mouseRenderPosition.y,
        });

        draggingComponent = undefined;

        this.canvas.style.cursor = cursorStyle;
      }
    });
  }
}
