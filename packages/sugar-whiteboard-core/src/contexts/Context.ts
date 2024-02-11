/**
 * Responsible for handling events and sending appropriate commands to particular components
 * Context follow Strategy + Command pattern.
 *
 * It is strategy pattern in a way that one context can exist at any given time.
 * And current context can be changed in runtime.
 * For example, user clicks on particular icon (Pen) to switch to draw tool
 *
 * It is part of the command pattern because it initiates requests to the particular components
 * and those components handle the logic
 */
import { Controller } from "../controllers/Controller";
import {
  Component,
  ComponentsTree,
  InputEventsListener,
} from "sugar-canvas-ui";

export class Context {
  protected controllers: Controller[] = [];
  protected componentsTree: ComponentsTree;
  protected inputEventsListener: InputEventsListener;
  protected onUnmountListeners: (() => void)[] = [];

  constructor() {
    this.componentsTree = ComponentsTree.getCurrentComponentsTree();
    this.inputEventsListener =
      InputEventsListener.getCurrentInputEventsListener();
  }

  public unmount() {
    const oldControllers = [...this.controllers];
    this.controllers = [];

    oldControllers.forEach((controller) => controller.unmount());

    this.onUnmountListeners.forEach((cb) => cb());
  }

  public onUnmount(cb: () => void) {
    this.onUnmountListeners.push(cb);
  }

  public addComponent(component: Component) {
    this.componentsTree.addComponent(component);
  }

  public removeComponent(component: Component) {
    this.componentsTree.removeComponent(component);
  }
}
