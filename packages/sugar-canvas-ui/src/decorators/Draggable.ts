import { Component } from "../components";
import { Vector } from "../atoms";
import { Constructor } from "../utils/type";
import { MouseEvent } from "src/events";

type DragState = {
  isDragging: boolean;
  startWaitTimerId: any;
  dragOffset: Vector;
};

export function Draggable() {
  return function <T extends Constructor<Component>>(BaseComponent: T) {
    return class DraggableComponent extends BaseComponent {
      public dragState: DragState = {
        dragOffset: new Vector(0, 0),
        isDragging: false,
        startWaitTimerId: undefined,
      };

      constructor(...args: any[]) {
        super(...args);
      }

      public handleMouseDownEvent(event: MouseEvent): void {
        super.handleMouseDownEvent(event);

        if (event.mouseButton !== 0) {
          return;
        }

        if (!!this.dragState.startWaitTimerId) {
          clearTimeout(this.dragState.startWaitTimerId);
        }

        event.stopPropagation();
        this.dragState.startWaitTimerId = setTimeout(() => {
          this.dragState.dragOffset = new Vector(
            event.mouseRenderPosition.x - this.getPosition().x,
            event.mouseRenderPosition.y - this.getPosition().y
          );
          this.dragState.isDragging = true;
        }, 100);
      }

      public handleMouseMoveEvent(event: MouseEvent): void {
        if (!this.dragState.isDragging) return;

        this.setPosition(
          new Vector(
            event.mouseRenderPosition.x - this.dragState.dragOffset.x,
            event.mouseRenderPosition.y - this.dragState.dragOffset.y
          )
        );
      }

      public handleMouseUpEvent(): void {
        if (!this.dragState.isDragging) return;

        clearTimeout(this.dragState.startWaitTimerId);
        this.dragState.isDragging = false;
      }
    };
  };
}
