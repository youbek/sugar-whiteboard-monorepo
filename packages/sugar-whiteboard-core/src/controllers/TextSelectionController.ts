import { MouseEvent, TextComponent } from "sugar-canvas-ui";
import { Controller } from "./Controller";

export type TextSelectionControllerOptions = {
  onSelect: (selectedTextComponent: TextComponent) => void;
};

export class TextSelectionController extends Controller {
  private onSelect: (selectedTextComponent: TextComponent) => void;

  constructor(options: TextSelectionControllerOptions) {
    super();

    this.onSelect = options.onSelect;
  }

  private handleMouseDblClickEvent(event: MouseEvent) {
    if (!(event.target instanceof TextComponent)) return;

    this.onSelect(event.target);
  }

  public mount(): void {
    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "dblclick",
        this.handleMouseDblClickEvent.bind(this)
      )
    );
  }
}
