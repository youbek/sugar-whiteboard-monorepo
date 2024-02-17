/**
 * Responsible for handling events and sending appropriate commands to particular components
 */
import { Whiteboard } from "../Whiteboard";
import { DrawController } from "../controllers/DrawController";
import { Context } from "./Context";

export class DrawContext extends Context {
  constructor(whiteboard: Whiteboard) {
    super(whiteboard);

    const controller = new DrawController();
    this.controllers.push(controller);

    controller.mount();
  }
}
