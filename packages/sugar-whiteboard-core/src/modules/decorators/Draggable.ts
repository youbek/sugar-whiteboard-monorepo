import { Viewport } from "../rendering/Viewport";
import { Component } from "../components";
import { MouseComponent } from "../components/MouseComponent";
import { Vector } from "../../atoms";
import { Constructor } from "../../utils/type";

export function Draggable() {
  return function <T extends Constructor<Component>>(BaseComponent: T) {
    return class DraggableComponent extends BaseComponent {
      constructor(...args: any[]) {
        super(...args);
      }

      public init() {
        super.init();

        this.setupDragging();
      }

      public setupDragging() {
        const viewport = Viewport.getCurrentViewport();

        if (!viewport) {
          throw new Error(`Current active Viewport not found!`);
        }

        const mouseComponent = MouseComponent.getCurrentMouse();

        if (!mouseComponent) {
          throw new Error(`Current active MouseComponent not found!`);
        }

        // TODO: Refactor it to better get canvas of the whiteboard. Maybe singleton pattern?
        const canvas = document.getElementsByTagName("canvas")[0];

        if (!canvas) {
          throw new Error(`SugarWhiteboard canvas not found!`);
        }

        let prevWaitTimerId: any = undefined;
        let isDragging = false;
        let offset = new Vector(0, 0); // offset between original position (just before drag start)
        let cursorStyle = canvas.style.cursor;

        canvas.addEventListener("mousedown", (event) => {
          if (!!prevWaitTimerId) {
            clearTimeout(prevWaitTimerId);
          }

          prevWaitTimerId = setTimeout(() => {
            isDragging = mouseComponent.isColliding(this);

            if (!isDragging) return;

            const rect = canvas.getBoundingClientRect();
            const mousePosition = new Vector(
              event.clientX - rect.left,
              event.clientY - rect.top
            );

            const mouseRenderPosition =
              viewport.calculateRenderPosition(mousePosition);

            offset = new Vector(
              mouseRenderPosition.x - this.getPosition().x,
              mouseRenderPosition.y - this.getPosition().y
            );

            canvas.style.cursor = "grabbing";
          }, 100);
        });

        canvas.addEventListener("mousemove", (event) => {
          if (!isDragging) return;

          const rect = canvas.getBoundingClientRect();
          const mousePosition = new Vector(
            event.clientX - rect.left,
            event.clientY - rect.top
          );
          const mouseRenderPosition =
            viewport.calculateRenderPosition(mousePosition);

          this.setPosition(
            new Vector(
              mouseRenderPosition.x - offset.x,
              mouseRenderPosition.y - offset.y
            )
          );
        });

        canvas.addEventListener("mouseup", () => {
          if (!isDragging) return;

          clearTimeout(prevWaitTimerId);
          canvas.style.cursor = cursorStyle;
          isDragging = false;
        });
      }
    };
  };
}
