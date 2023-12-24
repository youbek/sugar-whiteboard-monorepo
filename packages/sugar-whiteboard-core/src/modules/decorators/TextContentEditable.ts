import _ from "lodash";
import { Color, Vector, Text } from "../../atoms";
import { Constructor } from "../../utils/type";
import {
  TextComponent,
  ComponentMode,
  MouseComponent,
  DrawContext,
} from "../components";
import { ComponentsTree, Viewport } from "../rendering";

export function TextContentEditable() {
  return function <T extends Constructor<TextComponent>>(Base: T) {
    return class TextContentEditableClass extends Base {
      // By previous it means after last edit mode
      public prevTextContent = "";

      public caretIndex = 0;

      public caretColor = new Color(0, 0, 0, 1);
      public editBorderColor = new Color(66, 195, 255, 1);
      public editModePadding = 5;

      public blinkDelay = 0.5; // 0.5 second
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
        this.text.deleteContent({
          start: this.caretIndex - 1,
          end: this.caretIndex,
        });
        this.moveCaretHorizontal(-1);
      }

      public insertText(text: string) {
        this.text.insertContent(text, this.caretIndex);
        this.moveCaretHorizontal(text.length);
      }

      public moveCaretHorizontal(change: number) {
        this.caretIndex = _.clamp(
          this.caretIndex + change,
          0,
          this.text.getContent().length
        );
      }

      public moveCaretVertical(direction: number) {
        const lines = this.text.getLines();

        console.log(lines);

        let carotLineIndex: number | undefined = undefined;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const isCaretInThisLine =
            this.caretIndex >= line.startIndex &&
            this.caretIndex < line.endIndex;
          if (isCaretInThisLine) {
            carotLineIndex = i;
            break;
          }
        }

        if (carotLineIndex === undefined) {
          // Why? - If carot is in the position where new characters can be added. It exceeds text content total length.
          carotLineIndex = lines.length - 1;
        }

        const isUp = direction > 0;
        const caretLine = lines[carotLineIndex];
        const caretIndexInLine = this.caretIndex - caretLine.startIndex;

        console.log(caretIndexInLine);
        console.log(caretLine);
        console.log(this.caretIndex);

        if (isUp) {
          const prevLine = lines[carotLineIndex - 1];
          if (!prevLine) {
            return;
          }

          if (prevLine.content.length < caretIndexInLine) {
            this.caretIndex = prevLine.endIndex;
            return;
          }

          console.log("I'm HERE YOU MORON!");
          this.caretIndex = prevLine.startIndex + caretIndexInLine;
        }
      }

      public resetToPrevState() {
        this.text.setContent(this.prevTextContent);
      }

      public exitEditMode() {
        this.mode = ComponentMode.VIEW;

        if (!this.text.getContent().length) {
          const tree = ComponentsTree.getCurrentComponentsTree();
          tree.removeComponent(this);
        }
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
            this.exitEditMode();
          }
        });

        canvas.addEventListener("click", (event) => {
          event.preventDefault();

          const hasClicked = mouseComponent.isColliding(this);

          if (!hasClicked) {
            this.exitEditMode();
          }
        });

        this.mode = ComponentMode.EDIT;

        if (
          document.activeElement &&
          document.activeElement instanceof HTMLElement
        ) {
          console.log("Have you removed blur?");
          document.activeElement.blur();
        }
      }

      public drawEditBorder(context: DrawContext) {
        const textMetrics = this.text.multiLineTextMetrics(
          context.ctx,
          this.placeholderText || "Dummy Text"
        );

        const borderSize = new Vector(
          textMetrics.longestLineMetrics.width,
          (textMetrics.longestLineMetrics.fontBoundingBoxAscent +
            textMetrics.longestLineMetrics.fontBoundingBoxDescent) *
            textMetrics.lines.length
        );

        const renderPosition = context.viewport.calculateRenderPosition(
          this.position
        );

        context.ctx.strokeStyle = this.editBorderColor.toString();
        context.ctx.strokeRect(
          renderPosition.x - this.editModePadding,
          renderPosition.y -
            textMetrics.longestLineMetrics.fontBoundingBoxAscent -
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
          const textToCursor = new Text(
            this.text.getContent({
              start: 0,
              end: this.caretIndex,
            })
          );

          const textMetrics = textToCursor.multiLineTextMetrics(context.ctx);
          const height =
            (textMetrics.lastLineMetrics.fontBoundingBoxAscent +
              textMetrics.lastLineMetrics.fontBoundingBoxDescent) *
            (textMetrics.lines.length - 1);

          const position = new Vector(
            this.position.x +
              textMetrics.lastLineMetrics.width +
              this.editModePadding,
            this.position.y +
              height -
              (textMetrics.lastLineMetrics.fontBoundingBoxAscent +
                textMetrics.lastLineMetrics.fontBoundingBoxDescent) +
              this.editModePadding
          );

          context.ctx.fillStyle = this.caretColor.toString();
          const renderPosition =
            context.viewport.calculateRenderPosition(position);

          context.ctx.fillRect(
            renderPosition.x - this.editModePadding,
            renderPosition.y - this.editModePadding,
            2,
            textMetrics.lastLineMetrics.fontBoundingBoxAscent +
              textMetrics.lastLineMetrics.fontBoundingBoxDescent +
              this.editModePadding
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

          if (key === "Escape") {
            this.resetToPrevState();
            this.exitEditMode();
            return;
          }

          if (key === "Backspace" || key === "Delete") {
            this.deleteText();
            return;
          }

          if (key === "Space") {
            this.insertText(" ");
            return;
          }

          if (key === "ArrowLeft") {
            this.moveCaretHorizontal(-1);
            return;
          }

          if (key === "ArrowRight") {
            this.moveCaretHorizontal(1);
            return;
          }

          if (key === "ArrowUp") {
            this.moveCaretVertical(1);
            return;
          }

          if (key === "ArrowDown") {
            this.moveCaretVertical(-1);
            return;
          }

          if (key === "Enter" || key === "Return") {
            if (event.shiftKey) {
              this.insertText("\n");
              return;
            }

            this.exitEditMode();
            return;
          }

          if (key === "Shift" || key === "Alt" || key === "Control") {
            return;
          }

          this.insertText(event.key);
          return;
        });
      }
    };
  };
}
