import { KeyboardEvent, MouseEvent, Vector } from "sugar-canvas-ui";
import { Controller } from "./Controller";
import { MainBoardComponent } from "../components";

export class PanController extends Controller {
  private isPanning: boolean = false;
  private isAltPressed: boolean = false;
  private startWaitTimerId: any;
  private startPosition: Vector = new Vector(0, 0);
  private mouseStartPosition: Vector = new Vector(0, 0);
  private mainBoardComponent: MainBoardComponent;

  constructor() {
    super();

    document.body.style.cursor = "default";

    const mainBoardComponent =
      this.componentsTree.findComponentOfType(MainBoardComponent);

    if (!mainBoardComponent) {
      throw new Error(`MainBoardComponent not found in the components tree!`);
    }

    this.mainBoardComponent = mainBoardComponent;
  }

  private handlePanStart(event: MouseEvent) {
    if (event.mouseButton !== 0 || !this.isAltPressed) {
      return;
    }

    event.stopPropagation();

    if (!!this.startWaitTimerId) {
      clearTimeout(this.startWaitTimerId);
    }

    this.startWaitTimerId = setTimeout(() => {
      this.mouseStartPosition = event.mouseCanvasPosition;
      this.startPosition = this.mainBoardComponent.getPosition();
      this.isPanning = true;
      document.body.style.cursor = "grabbing";
    }, 100);
  }

  private handlePanMove(event: MouseEvent) {
    if (!this.isPanning) return;

    event.stopPropagation();

    const moveChange = new Vector(
      event.mouseCanvasPosition.x - this.mouseStartPosition.x,
      event.mouseCanvasPosition.y - this.mouseStartPosition.y
    );

    this.mainBoardComponent.setPosition(
      new Vector(
        this.startPosition.x + moveChange.x,
        this.startPosition.y + moveChange.y
      )
    );
  }

  private handlePanEnd(event: MouseEvent) {
    if (!this.isPanning) return;

    event.stopPropagation();

    clearTimeout(this.startWaitTimerId);
    this.isPanning = false;
    document.body.style.cursor = "default";

    const moveChange = new Vector(
      event.mouseCanvasPosition.x - this.mouseStartPosition.x,
      event.mouseCanvasPosition.y - this.mouseStartPosition.y
    );

    this.mainBoardComponent.setPosition(
      new Vector(
        this.startPosition.x + moveChange.x,
        this.startPosition.y + moveChange.y
      )
    );
  }

  private handlePenAltKeyPress(event: KeyboardEvent) {
    if (event.key !== "Alt") {
      return;
    }

    event.stopPropagation();

    if (event.type === "keydown" && !this.isAltPressed) {
      this.isAltPressed = true;
      document.body.style.cursor = "grab";
      return;
    }

    if (event.type === "keyup" && this.isAltPressed) {
      this.isAltPressed = false;
      this.isPanning = false;
      document.body.style.cursor = "default";
      return;
    }
  }

  public mount(): void {
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "keydown",
        this.handlePenAltKeyPress.bind(this)
      )
    );
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "keyup",
        this.handlePenAltKeyPress.bind(this)
      )
    );
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mousedown",
        this.handlePanStart.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mousemove",
        this.handlePanMove.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mouseup",
        this.handlePanEnd.bind(this)
      )
    );
  }
}
