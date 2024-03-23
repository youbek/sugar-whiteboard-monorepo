import {
  ComponentsTree,
  InputEventsListener,
  KeyboardEvent,
} from "sugar-canvas-ui";
import { HotKeyEvent } from "sugar-canvas-ui/dist/events/HotKeyEvent";

export type OnUnmountContext = {
  /** @description Unmounting controller */
  controller: Controller;
};

export abstract class Controller {
  static undoStack: (() => Promise<void>)[] = [];
  static redoStack: (() => Promise<void>)[] = [];
  static undoEventListenerUnsubscribe: () => void;
  static redoEventListenerUnsubscribe: () => void;

  protected componentsTree: ComponentsTree;
  protected inputEventsListener: InputEventsListener;
  protected onUnmountListeners: ((context: OnUnmountContext) => void)[] = [];
  protected isUnmounted = false;
  protected eventListenerCleanUps: (() => void)[] = [];

  constructor() {
    this.componentsTree = ComponentsTree.getCurrentComponentsTree();
    this.inputEventsListener =
      InputEventsListener.getCurrentInputEventsListener();

    if (!Controller.undoEventListenerUnsubscribe) {
      Controller.undoEventListenerUnsubscribe =
        this.inputEventsListener.addEventListener(
          `hotkey-meta+z,ctrl+z`,
          Controller.handleUndoHotKey.bind(Controller)
        );
    }

    if (!Controller.redoEventListenerUnsubscribe) {
      Controller.redoEventListenerUnsubscribe =
        this.inputEventsListener.addEventListener(
          "hotkey-meta+shift+z,ctrl+shift+z",
          Controller.handleRedoHotKey.bind(Controller)
        );
    }
  }

  static handleUndoHotKey() {
    this.undo();
  }

  static handleRedoHotKey() {
    this.redo();
  }

  static undo() {
    alert("UNDO Controllers changes!");
  }

  static redo() {
    alert("REDO Controllers changes!");
  }

  public mount() {}

  public unmount() {
    if (this.isUnmounted) {
      console.error(`DEV_LOG: Unmounting already unmounted controller!`);
      return;
    }

    this.onUnmountListeners.forEach((cb) =>
      cb({
        controller: this,
      })
    );

    const oldEventListenerCleanUps = [...this.eventListenerCleanUps];
    this.eventListenerCleanUps = [];

    oldEventListenerCleanUps.forEach((unsubscribe) => unsubscribe());
  }

  public onUnmount(cb: (context: OnUnmountContext) => void) {
    this.onUnmountListeners.push(cb);
  }
}
