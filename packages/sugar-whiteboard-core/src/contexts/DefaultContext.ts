/**
 * Responsible for handling events on the canvas
 * For example clicking on particular element and starting to drag
 */

import {
  Component,
  KeyboardEvent,
  MouseEvent,
  Vector,
  Viewport,
} from "sugar-canvas-ui";
import { Context } from "./Context";
import { MainBoardComponent } from "../components";

type DragState = {
  startWaitTimerId: any;
  dragOffset: Vector;
  component: Component | null;
};

type PanState = {
  isPanning: boolean;
  isAltPressed: boolean;
  startWaitTimerId: any;
  startPosition: Vector;
  mouseStartPosition: Vector;
};

export class DefaultContext extends Context {
  private dragState: DragState = new Proxy(
    {
      dragOffset: new Vector(0, 0),
      startWaitTimerId: undefined,
      component: null,
    },
    {
      set: (target, property, value, reciever) => {
        if (property === "component") {
          if (value !== null) {
            document.body.style.cursor = "grabbing";
          } else {
            document.body.style.cursor = "default";
          }
        }

        return Reflect.set(target, property, value, reciever);
      },
    }
  );

  public panState: PanState = new Proxy(
    {
      isPanning: false,
      isAltPressed: false,
      mouseStartPosition: new Vector(0, 0),
      startPosition: new Vector(0, 0),
      startWaitTimerId: undefined,
    },
    {
      set: (target, property, value, reciever) => {
        if (property === "isAltPressed") {
          document.body.style.cursor = value ? "grab" : "default";
        }

        if (property === "isPanning") {
          document.body.style.cursor = value ? "grabbing" : "default";
        }

        return Reflect.set(target, property, value, reciever);
      },
    }
  );

  public mainBoardComponent: MainBoardComponent;

  constructor() {
    super();

    document.body.style.cursor = "default";

    this.inputEventsListener.addEventListener(
      "keydown",
      this.handlePenAltKeyPress.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "keyup",
      this.handlePenAltKeyPress.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "mousedown",
      this.handlePanStart.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "mousedown",
      this.handleDragStart.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "mousemove",
      this.handlePanMove.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "mousemove",
      this.handleDragging.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "mouseup",
      this.handlePanEnd.bind(this)
    );
    this.inputEventsListener.addEventListener(
      "mouseup",
      this.handleDragEnd.bind(this)
    );

    const mainBoardComponent =
      this.componentsTree.findComponentOfType(MainBoardComponent);

    if (!mainBoardComponent) {
      throw new Error(`MainBoardComponent not found in the components tree!`);
    }

    this.mainBoardComponent = mainBoardComponent;
  }

  private handleDragStart(event: MouseEvent) {
    if (event.target instanceof MainBoardComponent) {
      console.log(`DEV_LOG: MainBoardComponent isn't draggable!`);
      return;
    }

    if (!!this.dragState.startWaitTimerId) {
      clearTimeout(this.dragState.startWaitTimerId);
    }

    event.stopPropagation();

    this.dragState.startWaitTimerId = setTimeout(() => {
      this.dragState.component = event.target;

      this.dragState.dragOffset = new Vector(
        event.mouseRenderPosition.x - this.dragState.component.getPosition().x,
        event.mouseRenderPosition.y - this.dragState.component.getPosition().y
      );
    }, 100);
  }

  private handleDragging(event: MouseEvent) {
    if (!this.dragState.component) return;

    this.dragState.component.setPosition(
      new Vector(
        event.mouseRenderPosition.x - this.dragState.dragOffset.x,
        event.mouseRenderPosition.y - this.dragState.dragOffset.y
      )
    );
  }

  private handleDragEnd() {
    if (!this.dragState.component) return;

    clearTimeout(this.dragState.startWaitTimerId);
    this.dragState.component = null;
  }

  private handlePanStart(event: MouseEvent) {
    if (event.mouseButton !== 0 || !this.panState.isAltPressed) {
      return;
    }

    event.stopPropagation();

    if (!!this.panState.startWaitTimerId) {
      clearTimeout(this.panState.startWaitTimerId);
    }

    this.panState.startWaitTimerId = setTimeout(() => {
      this.panState.mouseStartPosition = event.mouseCanvasPosition;
      this.panState.startPosition = this.mainBoardComponent.getPosition();
      this.panState.isPanning = true;
    }, 100);
  }

  private handlePanMove(event: MouseEvent) {
    if (!this.panState.isPanning) return;

    event.stopPropagation();

    const moveChange = new Vector(
      event.mouseCanvasPosition.x - this.panState.mouseStartPosition.x,
      event.mouseCanvasPosition.y - this.panState.mouseStartPosition.y
    );

    this.mainBoardComponent.setPosition(
      new Vector(
        this.panState.startPosition.x - moveChange.x,
        this.panState.startPosition.y - moveChange.y
      )
    );
  }

  private handlePanEnd(event: MouseEvent) {
    if (!this.panState.isPanning) return;

    event.stopPropagation();

    clearTimeout(this.panState.startWaitTimerId);
    this.panState.isPanning = false;

    const moveChange = new Vector(
      event.mouseCanvasPosition.x - this.panState.mouseStartPosition.x,
      event.mouseCanvasPosition.y - this.panState.mouseStartPosition.y
    );

    this.mainBoardComponent.setPosition(
      new Vector(
        this.panState.startPosition.x - moveChange.x,
        this.panState.startPosition.y - moveChange.y
      )
    );
  }

  private handlePenAltKeyPress(event: KeyboardEvent) {
    if (event.key !== "Alt") {
      return;
    }

    event.stopPropagation();

    if (event.type === "keydown" && !this.panState.isAltPressed) {
      this.panState.isAltPressed = true;
      return;
    }

    if (event.type === "keyup" && this.panState.isAltPressed) {
      this.panState.isAltPressed = false;
      this.panState.isPanning = false;
      return;
    }
  }
}
