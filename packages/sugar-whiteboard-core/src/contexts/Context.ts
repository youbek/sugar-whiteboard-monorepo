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
import { ComponentsTree, InputEventsListener } from "sugar-canvas-ui";

export class Context {
  protected componentsTree: ComponentsTree;
  protected inputEventsListener: InputEventsListener;

  constructor() {
    this.componentsTree = ComponentsTree.getCurrentComponentsTree();
    this.inputEventsListener =
      InputEventsListener.getCurrentInputEventsListener();
  }
}
