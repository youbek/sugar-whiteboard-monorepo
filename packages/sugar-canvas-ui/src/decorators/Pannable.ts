import { Vector } from "../atoms";
import { Constructor } from "../utils/type";
import { Component, MouseComponent } from "../components";
import { Viewport } from "../rendering/Viewport";

export function Pannable() {
  return function <T extends Constructor<Component>>(BaseComponent: T) {
    return class PannableComponent extends BaseComponent {
      constructor(...args: any[]) {
        super(...(args as []));
      }

      public init() {
        super.init();

        this.setupPanning();
      }

      public setupPanning() {
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
        let isPanning = false;
        let cursorStyle = canvas.style.cursor;

        let mouseStart = new Vector(0, 0);
        let startPosition = this.getPosition();

        canvas.addEventListener("mousedown", (event) => {
          if (event.button !== 1) {
            return;
          }

          if (!!prevWaitTimerId) {
            clearTimeout(prevWaitTimerId);
          }

          prevWaitTimerId = setTimeout(() => {
            isPanning = mouseComponent.isColliding(this);

            if (!isPanning) return;

            const rect = canvas.getBoundingClientRect();
            const mousePosition = new Vector(
              event.clientX - rect.left,
              event.clientY - rect.top
            );

            mouseStart = new Vector(mousePosition.x, mousePosition.y);
            startPosition = this.getPosition();

            canvas.style.cursor = "grabbing";
          }, 100);
        });

        canvas.addEventListener("mousemove", (event) => {
          if (!isPanning) return;

          const rect = canvas.getBoundingClientRect();
          const mousePosition = new Vector(
            event.clientX - rect.left,
            event.clientY - rect.top
          );

          const moveChange = new Vector(
            mousePosition.x - mouseStart.x,
            mousePosition.y - mouseStart.y
          );

          this.setPosition(
            new Vector(
              startPosition.x - moveChange.x,
              startPosition.y - moveChange.y
            )
          );
        });

        canvas.addEventListener("mouseup", (event) => {
          if (!isPanning) return;

          clearTimeout(prevWaitTimerId);
          canvas.style.cursor = cursorStyle;
          isPanning = false;

          const rect = canvas.getBoundingClientRect();
          const mousePosition = new Vector(
            event.clientX - rect.left,
            event.clientY - rect.top
          );

          const moveChange = new Vector(
            mousePosition.x - mouseStart.x,
            mousePosition.y - mouseStart.y
          );

          this.setPosition(
            new Vector(
              startPosition.x - moveChange.x,
              startPosition.y - moveChange.y
            )
          );
        });
      }
    };
  };
}
