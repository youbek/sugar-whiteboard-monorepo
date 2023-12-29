import { Vector } from "../atoms";
import { Constructor } from "../utils/type";
import { Component, MouseComponent } from "../components";
import { Viewport } from "../rendering/Viewport";
import { MouseEvent } from "src/events";

type PanningState = {
  isPanning: boolean;
  startWaitTimerId: any;
  startPosition: Vector;
  mouseStartPosition: Vector;
};

export function Pannable() {
  return function <T extends Constructor<Component>>(BaseComponent: T) {
    return class PannableComponent extends BaseComponent {
      public panningState: PanningState = {
        isPanning: false,
        mouseStartPosition: new Vector(0, 0),
        startPosition: new Vector(0, 0),
        startWaitTimerId: undefined,
      };

      constructor(...args: any[]) {
        super(...(args as []));
      }

      public handleMouseDownEvent(event: MouseEvent): void {
        if (event.mouseButton !== 1) {
          return;
        }

        event.stopPropagation();

        if (!!this.panningState.startWaitTimerId) {
          clearTimeout(this.panningState.startWaitTimerId);
        }

        this.panningState.startWaitTimerId = setTimeout(() => {
          this.panningState.mouseStartPosition = event.mouseCanvasPosition;
          this.panningState.startPosition = this.getPosition();
          this.panningState.isPanning = true;
        }, 100);
      }

      public handleMouseMoveEvent(event: MouseEvent): void {
        if (!this.panningState.isPanning) return;

        const moveChange = new Vector(
          event.mouseCanvasPosition.x - this.panningState.mouseStartPosition.x,
          event.mouseCanvasPosition.y - this.panningState.mouseStartPosition.y
        );

        this.setPosition(
          new Vector(
            this.panningState.startPosition.x - moveChange.x,
            this.panningState.startPosition.y - moveChange.y
          )
        );
      }

      public handleMouseUpEvent(event: MouseEvent): void {
        if (!this.panningState.isPanning) return;

        event.stopPropagation();

        clearTimeout(this.panningState.startWaitTimerId);
        this.panningState.isPanning = false;

        const moveChange = new Vector(
          event.mouseCanvasPosition.x - this.panningState.mouseStartPosition.x,
          event.mouseCanvasPosition.y - this.panningState.mouseStartPosition.y
        );

        this.setPosition(
          new Vector(
            this.panningState.startPosition.x - moveChange.x,
            this.panningState.startPosition.y - moveChange.y
          )
        );
      }
    };
  };
}
