import { Component, MouseEvent, Vector } from "sugar-canvas-ui";
import { Controller } from "./Controller";
import { MainBoardComponent } from "../components";

export class DragController extends Controller {
  private dragOffset = new Vector(0, 0);
  private startWaitTimerId: any = undefined;
  private draggingComponent: Component | null = null;

  private handleDragStart(event: MouseEvent) {
    if (event.target instanceof MainBoardComponent) {
      console.log(`DEV_LOG: MainBoardComponent isn't draggable!`);
      return;
    }

    if (!!this.startWaitTimerId) {
      clearTimeout(this.startWaitTimerId);
    }

    event.stopPropagation();

    this.startWaitTimerId = setTimeout(() => {
      this.draggingComponent = event.target;
      document.body.style.cursor = "grabbing";

      this.dragOffset = new Vector(
        event.mouseRenderPosition.x - this.draggingComponent.getPosition().x,
        event.mouseRenderPosition.y - this.draggingComponent.getPosition().y
      );
    }, 100);
  }

  private handleDragging(event: MouseEvent) {
    if (!this.draggingComponent) return;

    this.draggingComponent.setPosition(
      new Vector(
        event.mouseRenderPosition.x - this.dragOffset.x,
        event.mouseRenderPosition.y - this.dragOffset.y
      )
    );
  }

  private handleDragEnd() {
    if (!this.draggingComponent) return;

    clearTimeout(this.startWaitTimerId);
    this.draggingComponent = null;
    document.body.style.cursor = "default";
  }

  public mount() {
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mousedown",
        this.handleDragStart.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mousemove",
        this.handleDragging.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mouseup",
        this.handleDragEnd.bind(this)
      )
    );
  }
}
