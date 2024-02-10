/**
 * Responsible for handling events on the canvas for inserting text
 * For example, spawning text component on the clicked place
 */
import { TextComponent } from "sugar-canvas-ui";
import { Context } from "./Context";
import { Controller, OnUnmountContext } from "../controllers/Controller";
import { DragController } from "../controllers/DragController";
import { TextController } from "../controllers/TextController";

export class TextContext extends Context {
  private controllers: Controller[] = [];

  constructor() {
    super();

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
      return this.unmount();
    }
  }

  public addTextComponent() {
    const textComponent = new TextComponent();

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

    this.addComponent(textComponent);
  }

  public unmount(): void {
    const oldControllers = [...this.controllers];
    this.controllers = [];

    oldControllers.forEach((controller) => controller.unmount());

    super.unmount();
  }
}
