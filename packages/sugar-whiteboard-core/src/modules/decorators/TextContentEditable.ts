import _ from "lodash";
import { Color, Vector } from "../../atoms";
import { Constructor } from "../../utils/type";
import {
  TextComponent,
  ComponentMode,
  MouseComponent,
  DrawContext,
} from "../components";
import { Viewport } from "../rendering";

export function TextContentEditable() {
  return function <T extends Constructor<TextComponent>>(Base: T) {
    return class TextContentEditableClass extends Base {
      public caretIndex = 0;
      public caretColor = new Color(0, 0, 0, 1);
      public editBorderColor = new Color(66, 195, 255, 1);
      public editModePadding = 5;

      public blinkDelay = 2; // 2 second
      public blinkTimer = 0;
      public shouldDrawCursor = true;

      constructor(...args: any[]) {
        super(...args);
      }

      public init() {
        super.init();

        this.handleFocus();
        this.handleTextEdit();
      }

      public deleteText() {
        this.textContent =
          this.textContent.substring(0, this.caretIndex - 1) +
          this.textContent.substring(this.caretIndex, this.textContent.length);
        this.moveCaret(-1);
      }

      public insertText(text: string) {
        this.textContent =
          this.textContent.slice(0, this.caretIndex) +
          text +
          this.textContent.slice(this.caretIndex);
        this.moveCaret(text.length);
      }

      public moveCaret(change: number) {
        this.caretIndex += change;
      }

      public exitEditMode() {
        this.mode = ComponentMode.VIEW;
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

      public drawEditBorder(context: DrawContext) {
        const textMetrics = context.ctx.measureText(
          this.textContent || this.placeholderText || "Dummy Text"
        );
        const borderSize = new Vector(
          textMetrics.width,
          textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent
        );

        const renderPosition = context.viewport.calculateRenderPosition(
          this.position
        );

        context.ctx.strokeStyle = this.editBorderColor.toString();
        context.ctx.strokeRect(
          renderPosition.x - this.editModePadding,
          renderPosition.y -
            textMetrics.fontBoundingBoxAscent -
            this.editModePadding,
          borderSize.x + this.editModePadding,
          borderSize.y + this.editModePadding
        );

        this.size = borderSize;
      }

      public drawCursor(context: DrawContext) {
        this.blinkTimer += context.deltaTime;

        if (this.blinkTimer > this.blinkDelay) {
          this.blinkTimer = 0;
          this.shouldDrawCursor = !this.shouldDrawCursor;
        }

        if (this.shouldDrawCursor) {
          const textToCursor = (this.textContent || "").substring(
            0,
            this.caretIndex
          );

          const textMetrics = context.ctx.measureText(textToCursor);
          const position = new Vector(
            this.position.x + textMetrics.width + this.editModePadding,
            this.position.y - textMetrics.fontBoundingBoxAscent
          );

          context.ctx.fillStyle = this.caretColor.toString();
          const renderPosition =
            context.viewport.calculateRenderPosition(position);

          context.ctx.fillRect(
            renderPosition.x - this.editModePadding,
            renderPosition.y - this.editModePadding,
            2,
            this.size.y + this.editModePadding
          );
        }
      }

      public draw(context: DrawContext): void {
        super.draw(context);

        if (this.mode === ComponentMode.EDIT) {
          this.drawEditBorder(context);
          this.drawCursor(context);
        } else {
          this.blinkTimer = 0;
        }
      }

      public handleTextEdit() {
        const viewport = Viewport.getCurrentViewport();

        if (!viewport) {
          throw new Error(`Current active Viewport not found!`);
        }

        window.addEventListener("keydown", (event) => {
          if (this.mode !== ComponentMode.EDIT) return;

          const key = event.key;

          if (key === "Backspace" || key === "Delete") {
            this.deleteText();
            return;
          }

          if (key === "Space") {
            this.insertText(" ");
            return;
          }

          if (key === "ArrowLeft") {
            this.moveCaret(-1);
            return;
          }

          if (key === "ArrowRight") {
            this.moveCaret(1);
            return;
          }

          if (key === "Enter" || key === "Return") {
            this.exitEditMode();
            return;
          }

          if (
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            this.insertText(event.key);
            return;
          }
        });
      }
    };
  };
}
