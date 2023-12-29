import { Constructor } from "../utils/type";
import { Component } from "../components/Component";
import { MouseEvent } from "src/events";

export function FollowMousePosition() {
  return function <T extends Constructor<Component>>(Base: T) {
    return class FollowMousePositionClass extends Base {
      constructor(...args: any[]) {
        super(...args);
      }

      public handleMouseMoveEvent(event: MouseEvent): void {
        super.handleMouseMoveEvent(event);

        this.setPosition(event.mouseCanvasPosition);
      }
    };
  };
}
