/**
 * Singleton class that keeps stack of actions that will be dispatched by controllers/context
 */

import { ComponentsTree, InputEventsListener } from "sugar-canvas-ui";

export type UndoRedoActionParams = {
  componentsTree: ComponentsTree;
};

export type UndoRedoAction =
  | ((params: UndoRedoActionParams) => void)
  | ((params: UndoRedoActionParams) => Promise<void>);

export class UndoRedoContainer {
  private static currentUndoRedoContainer: UndoRedoContainer;

  private maxUndoRedoStackSize = 50;
  private undoStack: UndoRedoAction[] = [];
  private redoStack: UndoRedoAction[] = [];

  // Index of last undo/redo action in the undo/redo stack
  private undoRedoIndex: number = 0;

  protected componentsTree: ComponentsTree;
  protected inputEventsListener: InputEventsListener;

  constructor() {
    if (UndoRedoContainer.currentUndoRedoContainer) {
      throw new Error(`DEV_LOG: UndoRedoContainer already initialized!`);
    }

    this.componentsTree = ComponentsTree.getCurrentComponentsTree();
    this.inputEventsListener =
      InputEventsListener.getCurrentInputEventsListener();

    const undoHotKeys =
      window.navigator.userAgent.indexOf("Windows") !== -1
        ? "ctrl+z"
        : "command+z";

    this.inputEventsListener.addEventListener(
      `hotkey-${undoHotKeys}`,
      this.handleUndoHotKey.bind(this)
    );

    const redoHotKeys =
      window.navigator.userAgent.indexOf("Windows") !== -1
        ? "ctrl+shift+z"
        : "command+shift+z";

    this.inputEventsListener.addEventListener(
      `hotkey-${redoHotKeys}`,
      this.handleRedoHotKey.bind(this)
    );

    UndoRedoContainer.currentUndoRedoContainer = this;
  }

  private handleUndoHotKey() {
    const action = this.undoStack[this.undoRedoIndex - 1];

    if (action) {
      this.undoRedoIndex--;
      action({ componentsTree: this.componentsTree });
    }
  }

  private handleRedoHotKey() {
    // Don't subtract - 1 from like in handleUndoHotKey,
    // because this.undoRedoIndex because redo is the future
    const action = this.redoStack[this.undoRedoIndex];

    if (action) {
      this.undoRedoIndex++;
      action({ componentsTree: this.componentsTree });
    }
  }

  public saveUndoRedoActions(
    undoAction: UndoRedoAction,
    redoAction: UndoRedoAction
  ) {
    const shouldDeleteUndoRedoStack =
      this.undoRedoIndex !== this.undoStack.length;
    if (shouldDeleteUndoRedoStack) {
      this.undoStack = this.undoStack.slice(0, this.undoRedoIndex);
      this.redoStack = this.redoStack.slice(0, this.undoRedoIndex);
    }

    this.undoStack.push(undoAction);
    this.redoStack.push(redoAction);

    const exitedMaximumSize = this.undoStack.length > this.maxUndoRedoStackSize;
    if (exitedMaximumSize) {
      this.undoStack.shift();
    }

    this.undoRedoIndex = this.undoStack.length;
  }

  public static getCurrentUndoRedoContainer() {
    if (!UndoRedoContainer.currentUndoRedoContainer) {
      throw new Error(`DEV_LOG: UndoRedoContainer has not been initialized!`);
    }

    return UndoRedoContainer.currentUndoRedoContainer;
  }
}
