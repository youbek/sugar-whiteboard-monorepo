/**
 * Responsible for handling events on the canvas
 * For example clicking on particular element and starting to drag
 */
import { Context } from "./Context";
import { Controller } from "../controllers/Controller";
import { DragController } from "../controllers/DragController";
import { PanController } from "../controllers/PanController";

export class DefaultContext extends Context {
  constructor() {
    super();

    this.controllers.push(new DragController());
    this.controllers.push(new PanController());

    this.controllers.forEach((controller) => controller.mount());
  }
}
