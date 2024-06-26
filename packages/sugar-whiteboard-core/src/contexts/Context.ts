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
import { Whiteboard } from "../Whiteboard";
import { Controller } from "../controllers/Controller";
import {
  Component,
  ComponentsTree,
  InputEventsListener,
} from "sugar-canvas-ui";
import { UndoRedoContainer } from "../modules/UndoRedoContainer";
import { ZoomLevelController } from "../controllers/ZoomLevelController";

export class Context {
  protected whiteboard: Whiteboard;
  protected controllers: Controller[] = [];
  protected componentsTree: ComponentsTree;
  protected undoRedoContainer: UndoRedoContainer;
  protected inputEventsListener: InputEventsListener;
  protected onUnmountListeners: (() => void)[] = [];

  static undoStack: (() => Promise<void>)[] = [];
  static redoStack: (() => Promise<void>)[] = [];
  static undoEventListenerUnsubscribe: () => void;
  static redoEventListenerUnsubscribe: () => void;

  constructor(whiteboard: Whiteboard) {
    this.whiteboard = whiteboard;
    this.componentsTree = ComponentsTree.getCurrentComponentsTree();
    this.inputEventsListener =
      InputEventsListener.getCurrentInputEventsListener();
    this.undoRedoContainer = UndoRedoContainer.getCurrentUndoRedoContainer();

    this.controllers = [new ZoomLevelController()];
  }

  public unmount() {
    const oldControllers = [...this.controllers];
    this.controllers = [];

    oldControllers.forEach((controller) => controller.unmount());

    // make sure to run async to get the latest syncrounous changes
    setTimeout(() => {
      this.onUnmountListeners.forEach((cb) => cb());
    }, 1000);
  }

  public onUnmount(cb: () => void) {
    this.onUnmountListeners.push(cb);
  }

  public addComponent(component: Component) {
    this.componentsTree.addComponent(component);

    this.undoRedoContainer.saveUndoRedoActions(
      (params) => {
        params.componentsTree.removeComponent(component);
      },
      (params) => {
        params.componentsTree.addComponent(component);
      }
    );
  }

  public removeComponent(component: Component) {
    this.componentsTree.removeComponent(component);
  }
}
