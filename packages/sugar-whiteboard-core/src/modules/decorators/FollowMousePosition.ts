import { Vector } from "../../atoms";
import { Constructor } from "../../utils/type";
import { Component } from "../components/Component";

export function FollowMousePosition() {
  return function <T extends Constructor<Component>>(Base: T) {
    return class FollowMousePositionClass extends Base {
      constructor(...args: any[]) {
        super(...args);
      }

      public init() {
        super.init();

        this.followMousePosition();
      }

      public followMousePosition() {
        // TODO: Refactor it to better get canvas of the whiteboard. Maybe singleton pattern?
        const canvas = document.getElementsByTagName("canvas")[0];

        if (!canvas) {
          throw new Error(`SugarWhiteboard canvas not found!`);
        }

        canvas.addEventListener("mousemove", (event) => {
          const rect = canvas.getBoundingClientRect();
          const mousePosition = new Vector(
            event.clientX - rect.left,
            event.clientY - rect.top
          );

          this.setPosition(mousePosition);
        });
      }
    };
  };
}
