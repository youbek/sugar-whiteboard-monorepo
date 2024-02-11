/**
 * Responsible for handling events and sending appropriate commands to particular components
 */
import { DrawController } from "../controllers/DrawController";
import { Context } from "./Context";

export class DrawContext extends Context {
  constructor() {
    super();

    const controller = new DrawController();
    this.controllers.push(controller);

    controller.mount();
  }
}
