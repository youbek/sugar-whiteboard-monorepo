/**
 * Responsible for handling events on the canvas for inserting text
 * For example, spawning text component on the clicked place
 */
import { TextComponent } from "sugar-canvas-ui";
import { Context } from "./Context";
import { OnUnmountContext } from "../controllers/Controller";
import { DragController } from "../controllers/DragController";
import { TextController } from "../controllers/TextController";
import { Whiteboard } from "../Whiteboard";
import { DefaultContext } from "./DefaultContext";

export class TextContext extends Context {
  constructor(whiteboard: Whiteboard) {
    super(whiteboard);

    this.controllers.push(new DragController());
    this.controllers.forEach((controller) => controller.mount());
  }

  private handleTextControllerUnmount({
    controller: unmountingController,
  }: OnUnmountContext) {
    // If unmounting text controller is current one, not the old one. Then unmount the context itself.
    // Because user didn't select any new text so there is no new text controller
    if (
      this.controllers.some((controller) => controller === unmountingController)
    ) {
      // TODO: Probably 2 way data binding/reference is a bad idea. Controllers should not be aware of whiteboard object they are associated with
      // Possible solution: If whiteboard doesn't have context, automatically set the context to the default context, but do it in the Whiteboard class itself
      this.whiteboard.setContext(DefaultContext);
    }
  }

  public addTextComponent() {
    const textComponent = new TextComponent();
    this.addComponent(textComponent);
    this.setTextComponent(textComponent);
  }

  public setTextComponent(textComponent: TextComponent) {
    this.controllers = this.controllers.filter((controller) => {
      if (controller instanceof TextController) {
        // unmount and remove old text controller
        controller.unmount();
        return false;
      }

      return true;
    });

    const textController = new TextController(textComponent);
    this.controllers.push(textController);
    textController.mount();
    textController.onUnmount(this.handleTextControllerUnmount.bind(this));
  }
}
