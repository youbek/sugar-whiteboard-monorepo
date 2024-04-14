/**
 * Responsible for handling events on the canvas
 * For example clicking on particular element and starting to drag
 */
import { Context } from "./Context";
import { PanController } from "../controllers/PanController";
import { TextSelectionController } from "../controllers/TextSelectionController";
import { Whiteboard } from "../Whiteboard";
import { TextContext } from "./TextContext";
import { TransformController } from "../controllers/TransformController";

export class DefaultContext extends Context {
  constructor(whiteboard: Whiteboard) {
    super(whiteboard);

    this.controllers.push(new TransformController());

    this.controllers.push(new PanController());
    this.controllers.push(
      new TextSelectionController({
        onSelect: (textComponent) => {
          const textContext = this.whiteboard.setContext(TextContext);
          textContext.setTextComponent(textComponent);
        },
      })
    );

    this.controllers.forEach((controller) => controller.mount());
  }
}
