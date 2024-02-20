import { Whiteboard } from "../Whiteboard";
import { Context } from "./Context";
import { PanController } from "../controllers/PanController";
import { EraseController } from "../controllers/EraseController";

export class EraseContext extends Context {
  constructor(whiteboard: Whiteboard) {
    super(whiteboard);

    this.controllers.push(new PanController());
    this.controllers.push(new EraseController());

    this.controllers.forEach((controller) => controller.mount());
  }
}
