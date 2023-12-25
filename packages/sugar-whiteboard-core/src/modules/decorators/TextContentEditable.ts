import _ from "lodash";
import { Color, Vector, Text, TextSelection } from "../../atoms";
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
      public selectionStart = -1;

      public caretColor = new Color(0, 0, 0, 1);
      public editBorderColor = new Color(66, 195, 255, 1);
      public selectionColor = new Color(66, 195, 255, 0.2);

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

      public setCaretIndex(caretIndex: number, selectionStart: number = -1) {
        const withSelection = selectionStart !== -1;
        if (!withSelection) {
          this.selectionStart = -1;
        } else {
          this.selectionStart =
            this.selectionStart > 0 ? this.selectionStart : selectionStart;
        }

        this.caretIndex = caretIndex;
      }

      public deleteText() {
        const deleteSelection = this.selectionStart !== -1;

        if (deleteSelection) {
          this.text.deleteContent(
            new TextSelection(this.selectionStart, this.caretIndex)
          );
          this.moveCaretHorizontal(0);
        } else {
          this.text.deleteContent(
            new TextSelection(this.caretIndex - 1, this.caretIndex)
          );
          this.moveCaretHorizontal(-1);
        }
      }

      public insertText(text: string) {
        if (this.selectionStart !== -1) {
          this.deleteText();
        }

        this.text.insertContent(text, this.caretIndex);
        this.moveCaretHorizontal(text.length);
      }

      public moveCaretHorizontal(change: number, withSelection = false) {
        const newCaretIndex = _.clamp(
          this.caretIndex + change,
          0,
          this.text.getContent().length
        );
        this.setCaretIndex(
          newCaretIndex,
          withSelection ? this.caretIndex : undefined
        );
      }

      public moveCaretVertical(direction: number, withSelection = false) {
        const lines = this.text.getLines();

        let carotLineIndex: number | undefined = undefined;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const isCaretInThisLine =
            this.caretIndex >= line.startIndex &&
            this.caretIndex <= line.endIndex;
          if (isCaretInThisLine) {
            carotLineIndex = i;
            break;
          }
        }

        if (carotLineIndex === undefined) {
          throw new Error(`Line that carot is in cannot be found!`);
        }

        const isUp = direction > 0;
        const caretLine = lines[carotLineIndex];
        const caretIndexInLine = this.caretIndex - caretLine.startIndex;

        if (isUp) {
          const prevLine = lines[carotLineIndex - 1];
          if (!prevLine) return;

          if (prevLine.content.length < caretIndexInLine) {
            this.setCaretIndex(
              prevLine.endIndex,
              withSelection ? this.caretIndex : undefined
            );

            return;
          }

          this.setCaretIndex(
            prevLine.startIndex + caretIndexInLine,
            withSelection ? this.caretIndex : undefined
          );
        } else {
          const nextLine = lines[carotLineIndex + 1];
          if (!nextLine) return;

          if (nextLine.content.length < caretIndexInLine) {
            this.setCaretIndex(
              nextLine.endIndex,
              withSelection ? this.caretIndex : undefined
            );

            return;
          }
          this.setCaretIndex(
            nextLine.startIndex + caretIndexInLine,
            withSelection ? this.caretIndex : undefined
          );
        }
      }

      public resetToPrevState() {
        this.text.setContent(this.prevTextContent);
      }

      public exitEditMode() {
        this.mode = ComponentMode.VIEW;
        this.setCaretIndex(this.text.getContent().length);

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
          new Vector(
            this.position.x,
            this.position.y -
              textMetrics.longestLineMetrics.fontBoundingBoxAscent
          )
        );

        context.ctx.strokeStyle = this.editBorderColor.toString();
        context.ctx.strokeRect(
          renderPosition.x,
          renderPosition.y,
          borderSize.x,
          borderSize.y
        );

        this.size = borderSize;
      }

      public drawSelection(context: DrawContext) {
        if (this.selectionStart < 0) return;

        const selection = new TextSelection(
          this.selectionStart,
          this.caretIndex
        );
        const selectionText = new Text(this.text.getContent());
        const lines = selectionText.getLines();
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          const isNotSelectedLine = !(
            selection.end >= line.startIndex && line.endIndex >= selection.start
          );

          if (isNotSelectedLine) {
            console.log("YES!");
            continue;
          }

          const lineSelectionStart =
            selection.start < line.startIndex
              ? 0
              : selection.start - line.startIndex;
          const lineSelectionEnd =
            selection.end > line.endIndex
              ? line.content.length
              : line.content.length - (line.endIndex - selection.end);

          const lineSelection = new TextSelection(
            lineSelectionStart,
            lineSelectionEnd
          );

          const lineText = new Text(line.content);
          const lineSelectionText = new Text(
            lineText.getContent(lineSelection)
          );
          const lineSelectionMetrics = lineSelectionText.multiLineTextMetrics(
            context.ctx
          );

          const offsetText =
            lineSelection.start > 0
              ? new Text(
                  lineText.getContent(new TextSelection(0, lineSelection.start))
                )
              : "";

          let offsetTextBoxSize: Vector = new Vector(0, 0);

          if (offsetText) {
            const offsetMetrics = offsetText.multiLineTextMetrics(context.ctx);

            offsetTextBoxSize = new Vector(
              offsetMetrics.longestLineMetrics.width,
              (offsetMetrics.longestLineMetrics.fontBoundingBoxAscent +
                offsetMetrics.longestLineMetrics.fontBoundingBoxDescent) *
                offsetMetrics.lines.length
            );
          }

          const boxSize = new Vector(
            lineSelectionMetrics.longestLineMetrics.width,
            (lineSelectionMetrics.longestLineMetrics.fontBoundingBoxAscent +
              lineSelectionMetrics.longestLineMetrics.fontBoundingBoxDescent) *
              lineSelectionMetrics.lines.length
          );

          const renderPosition = context.viewport.calculateRenderPosition(
            new Vector(
              this.position.x + offsetTextBoxSize.x,
              this.position.y -
                lineSelectionMetrics.longestLineMetrics.fontBoundingBoxAscent
            )
          );

          context.ctx.fillStyle = this.selectionColor.toString();
          context.ctx.fillRect(
            renderPosition.x,
            renderPosition.y + boxSize.y * i,
            boxSize.x,
            boxSize.y
          );
        }
      }

      public drawCursor(context: DrawContext) {
        this.blinkTimer += context.deltaTime;

        if (this.blinkTimer > this.blinkDelay) {
          this.blinkTimer = 0;
          this.shouldDrawCursor = !this.shouldDrawCursor;
        }

        if (this.shouldDrawCursor) {
          const textToCursor = new Text(
            this.text.getContent(new TextSelection(0, this.caretIndex))
          );

          const textMetrics = textToCursor.multiLineTextMetrics(context.ctx);

          const height =
            (textMetrics.lastLineMetrics.fontBoundingBoxAscent +
              textMetrics.lastLineMetrics.fontBoundingBoxDescent) *
            (textMetrics.lines.length - 1);

          const position = new Vector(
            this.position.x +
              (textToCursor.getContent()
                ? textMetrics.lastLineMetrics.width
                : 0),
            this.position.y - textMetrics.lastLineMetrics.fontBoundingBoxAscent
          );

          context.ctx.fillStyle = this.caretColor.toString();
          const renderPosition =
            context.viewport.calculateRenderPosition(position);

          context.ctx.fillRect(
            renderPosition.x,
            renderPosition.y + height,
            2,
            textMetrics.lastLineMetrics.fontBoundingBoxAscent +
              textMetrics.lastLineMetrics.fontBoundingBoxDescent
          );
        }
      }

      public freezeCursorBlinking() {
        this.blinkTimer = 0;
        this.shouldDrawCursor = true;
      }

      public draw(context: DrawContext): void {
        super.draw(context);

        if (this.mode === ComponentMode.EDIT) {
          this.drawSelection(context);
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

        window.addEventListener("keydown", (event: KeyboardEvent) => {
          if (this.mode !== ComponentMode.EDIT) return;

          this.freezeCursorBlinking();

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
            this.moveCaretHorizontal(-1, event.shiftKey);
            return;
          }

          if (key === "ArrowRight") {
            this.moveCaretHorizontal(1, event.shiftKey);
            return;
          }

          if (key === "ArrowUp") {
            this.moveCaretVertical(1, event.shiftKey);
            return;
          }

          if (key === "ArrowDown") {
            this.moveCaretVertical(-1, event.shiftKey);
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

          if (key === "a" && event.ctrlKey) {
            this.setCaretIndex(this.text.getContent().length, 0);
            return;
          }

          if (key === "c" && event.ctrlKey && this.selectionStart > -1) {
            navigator.clipboard.writeText(
              this.text.getContent(
                new TextSelection(this.selectionStart, this.caretIndex)
              )
            );
            return;
          }

          if (key === "v" && event.ctrlKey) {
            navigator.clipboard.readText().then((text) => {
              this.insertText(text);
            });
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
