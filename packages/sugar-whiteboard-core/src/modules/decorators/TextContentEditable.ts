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
      public cursorIndex = 0;
      public cursorColor = new Color(0, 0, 0, 1);
      public editBorderColor = new Color(66, 195, 255, 1);
      public editModePadding = 5;

      public blinkDelay = 1; // 1 second
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
            this.cursorIndex
          );

          const textMetrics = context.ctx.measureText(textToCursor);
          const position = new Vector(
            this.position.x + textMetrics.width + this.editModePadding,
            this.position.y - textMetrics.fontBoundingBoxAscent
          );

          context.ctx.fillStyle = this.cursorColor.toString();
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

          if (event.key === "Backspace" || event.key === "Delete") {
            this.textContent = this.textContent.substring(
              0,
              this.textContent.length - 1
            );
          } else if (event.key === "Space") {
            this.textContent += " ";
          } else if (event.key === "ArrowLeft") {
            this.cursorIndex = _.clamp(
              this.cursorIndex - 1,
              0,
              this.textContent.length
            );
          } else if (event.key === "ArrowRight") {
            this.cursorIndex = _.clamp(
              this.cursorIndex + 1,
              0,
              this.textContent.length
            );
          } else if (event.key === "Enter" || event.key === "Return") {
            this.mode = ComponentMode.VIEW;
          } else if (
            event.key !== "Shift" &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            this.textContent += event.key;
            this.cursorIndex++;
          }
        });
      }
    };
  };
}
