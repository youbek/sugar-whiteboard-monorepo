import { ComponentsTree, InputEventsListener } from "sugar-canvas-ui";

export type OnUnmountContext = {
  /** @description Unmounting controller */
  controller: Controller;
};

export abstract class Controller {
  protected componentsTree: ComponentsTree;
  protected inputEventsListener: InputEventsListener;
  protected onUnmountListeners: ((context: OnUnmountContext) => void)[] = [];
  protected isUnmounted = false;
  protected eventListenerCleanUps: (() => void)[] = [];

  constructor() {
    this.componentsTree = ComponentsTree.getCurrentComponentsTree();
    this.inputEventsListener =
      InputEventsListener.getCurrentInputEventsListener();
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
