import {
  ComponentMode,
  KeyboardEvent,
  MouseEvent,
  TextComponent,
  TextSelection,
} from "sugar-canvas-ui";
import _ from "lodash";
import { Controller } from "./Controller";

export class TextController extends Controller {
  private textComponent: TextComponent;

  constructor(component: TextComponent) {
    super();

    this.textComponent = component;
    this.textComponent.setMode(ComponentMode.EDIT);
  }

  private setCaretIndex(caretIndex: number, selectionStart: number = -1) {
    this.textComponent.caretIndex = caretIndex;

    const withSelection = selectionStart !== -1;
    if (!withSelection) {
      this.textComponent.selection = null;
    } else {
      this.textComponent.selection =
        (this.textComponent.selection?.start || -1) > 0
          ? this.textComponent.selection
          : new TextSelection(selectionStart, this.textComponent.caretIndex);
    }
  }

  private deleteText() {
    if (this.textComponent.selection !== null) {
      this.textComponent.text.deleteContent(this.textComponent.selection);
      this.moveCaretHorizontal(0);
    } else {
      this.textComponent.text.deleteContent(
        new TextSelection(
          this.textComponent.caretIndex - 1,
          this.textComponent.caretIndex
        )
      );
      this.moveCaretHorizontal(-1);
    }
  }

  private insertText(text: string) {
    if (this.textComponent.selection !== null) {
      this.deleteText();
    }

    this.textComponent.text.insertContent(text, this.textComponent.caretIndex);
    this.moveCaretHorizontal(text.length);
  }

  private moveCaretHorizontal(change: number, withSelection = false) {
    const newCaretIndex = _.clamp(
      this.textComponent.caretIndex + change,
      0,
      this.textComponent.text.getContent().length
    );
    this.setCaretIndex(
      newCaretIndex,
      withSelection ? this.textComponent.caretIndex : undefined
    );
  }

  private moveCaretVertical(direction: number, withSelection = false) {
    const lines = this.textComponent.text.getLines();

    let carotLineIndex: number | undefined = undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isCaretInThisLine =
        this.textComponent.caretIndex >= line.startIndex &&
        this.textComponent.caretIndex <= line.endIndex;
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
    const caretIndexInLine =
      this.textComponent.caretIndex - caretLine.startIndex;

    if (isUp) {
      const prevLine = lines[carotLineIndex - 1];
      if (!prevLine) return;

      if (prevLine.content.length < caretIndexInLine) {
        this.setCaretIndex(
          prevLine.endIndex,
          withSelection ? this.textComponent.caretIndex : undefined
        );

        return;
      }

      this.setCaretIndex(
        prevLine.startIndex + caretIndexInLine,
        withSelection ? this.textComponent.caretIndex : undefined
      );
    } else {
      const nextLine = lines[carotLineIndex + 1];
      if (!nextLine) return;

      if (nextLine.content.length < caretIndexInLine) {
        this.setCaretIndex(
          nextLine.endIndex,
          withSelection ? this.textComponent.caretIndex : undefined
        );

        return;
      }
      this.setCaretIndex(
        nextLine.startIndex + caretIndexInLine,
        withSelection ? this.textComponent.caretIndex : undefined
      );
    }
  }

  private handleKeyboardDownEvent(event: KeyboardEvent): void {
    if (event.type === "hotkey") return;

    const key = event.key;

    if (key === "Meta") {
      return;
    }

    if (key === "Escape") {
      this.unmount();
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

      this.unmount();
      return;
    }

    if (key === "a" && event.ctrlKey) {
      this.setCaretIndex(this.textComponent.text.getContent().length, 0);
      return;
    }

    if (key === "c" && event.ctrlKey && this.textComponent.selection !== null) {
      navigator.clipboard.writeText(
        this.textComponent.text.getContent(this.textComponent.selection)
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

    this.insertText(event.key as unknown as string);
    return;
  }

  private handleMouseClickOutsideEvent(event: MouseEvent): void {
    if (event.target !== this.textComponent) return;

    this.unmount();
  }

  public mount() {
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "keydown",
        this.handleKeyboardDownEvent.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "outsideclick",
        this.handleMouseClickOutsideEvent.bind(this)
      )
    );
  }

  public unmount(): void {
    this.textComponent.removeMode(ComponentMode.EDIT);

    if (!this.textComponent.text.getContent().length) {
      this.componentsTree.removeComponent(this.textComponent);
    }

    super.unmount();
  }
}
