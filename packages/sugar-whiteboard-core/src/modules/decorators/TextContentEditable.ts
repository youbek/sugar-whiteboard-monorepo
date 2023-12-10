import { Constructor } from "../../utils/type";
import { Component, ComponentMode } from "../components";
import { Viewport } from "../rendering";

export function TextContentEditable() {
  return function <T extends Constructor<Component>>(Base: T) {
    return class TextContentEditableClass extends Base {
      public textContent = "";

      constructor(...args: any[]) {
        super(...args);

        this.handleTextEdit();
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

      public handleLooseFocus() {
        // TO BE IMPLEMENTED
      }

      public handleGrantFocus() {
        // TO BE IMPLEMENTED
      }
    };
  };
}
