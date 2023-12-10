import { Vector } from "src/atoms";
import { Constructor } from "../../utils/type";
import { Component, ComponentMode, MouseComponent } from "../components";
import { Viewport } from "../rendering";

export function TextContentEditable() {
  return function <T extends Constructor<Component>>(Base: T) {
    return class TextContentEditableClass extends Base {
      public textContent = "";

      constructor(...args: any[]) {
        super(...args);
      }

      public init() {
        super.init();

        this.handleFocus();
        this.handleTextEdit();
      }

      public handleFocus() {
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

        canvas.addEventListener("dblclick", (event) => {
          event.preventDefault();

          const hasClicked = mouseComponent.isColliding(this);

          if (hasClicked) {
            this.mode = ComponentMode.EDIT;
          } else {
            this.mode = ComponentMode.VIEW;
          }
        });

        canvas.addEventListener("click", (event) => {
          event.preventDefault();

          this.mode = ComponentMode.VIEW;
        });

        this.mode = ComponentMode.EDIT;
      }

      public handleTextEdit() {
        const viewport = Viewport.getCurrentViewport();

        if (!viewport) {
          throw new Error(`Current active Viewport not found!`);
        }

        window.addEventListener("keydown", (event) => {
          if (this.mode !== ComponentMode.EDIT) return;

          if (event.key === "Backspace" || event.key === "Delete") {
            this.textContent = this.textContent.substring(
              0,
              this.textContent.length - 1
            );
          } else if (event.key === "Space") {
            this.textContent += " ";
          } else if (
            event.key !== "Shift" &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            this.textContent += event.key;
          }
        });
      }
    };
  };
}
