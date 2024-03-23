import hotkeys from "hotkeys-js";

import { ComponentsTree, Viewport } from "../rendering";
import { Component, MouseComponent } from "../components";
import { MouseButton, MouseEvent, MouseEventType } from "./MouseEvent";
import { KeyboardEvent, KeyboardEventType } from "./KeyboardEvent";
import { Vector } from "../atoms";
import { HotKeyEvent, HotKeyEventType } from "./HotKeyEvent";

export type MouseEventListenerCallback = (
  event: MouseEvent
) => void | Promise<void>;

export type KeyboardEventListenerCallback = (
  event: KeyboardEvent
) => void | Promise<void>;

export type HotKeyEventListenerCallback = (
  event: HotKeyEvent
) => void | Promise<void>;

type InputEventsListenerConfig = {
  viewport: Viewport;
  mouseComponent: MouseComponent;
  componentsTree: ComponentsTree;
};

type EventListenerMap = Map<MouseEventType, MouseEventListenerCallback[]> &
  Map<KeyboardEventType, KeyboardEventListenerCallback[]> &
  Map<HotKeyEventType, HotKeyEvent>;

export class InputEventsListener {
  private static currentInputEventsListener: InputEventsListener;
  private viewport: Viewport;
  private mouseComponent: MouseComponent;
  private componentsTree: ComponentsTree;
  private eventListeners: EventListenerMap = new Map();

  constructor(config: InputEventsListenerConfig) {
    InputEventsListener.currentInputEventsListener = this;

    this.viewport = config.viewport;
    this.mouseComponent = config.mouseComponent;
    this.componentsTree = config.componentsTree;
  }

  public init() {
    this.listenMouseClick();
    this.listenMouseDblClick();
    this.listenMouseUp();
    this.listenMouseDown();
    this.listenMouseMove();
    this.listenKeyboardDown();
    this.listenKeyboardUp();
    this.listenHotKeys();
  }

  private listenMouseClick() {
    this.viewport.canvas.addEventListener("click", (domEvent) => {
      const clickInsideChain: Component[] = [];
      const clickOutsideChain: Component[] = [];

      for (const component of this.componentsTree.traverse()) {
        const isColliding = this.mouseComponent.isColliding(component);

        if (!isColliding) {
          clickOutsideChain.push(component);
        } else {
          clickInsideChain.push(component);
        }
      }

      if (!clickInsideChain.length && !clickOutsideChain.length) return;

      clickInsideChain.reverse();
      clickOutsideChain.reverse();

      const rect = this.viewport.canvas.getBoundingClientRect();
      const mouseCanvasPosition = new Vector(
        domEvent.clientX - rect.left,
        domEvent.clientY - rect.top
      );

      const mouseRenderPosition =
        this.viewport.calculateRenderPosition(mouseCanvasPosition);

      for (const component of clickInsideChain) {
        const clickInsideMouseEvent = new MouseEvent({
          mouseRenderPosition,
          mouseCanvasPosition,
          mouseButton: domEvent.button as MouseButton,
          type: "click",
          target: component,
        });

        this.notifyEventListeners(clickInsideMouseEvent);

        if (!clickInsideMouseEvent.shouldPropagate) {
          break;
        }
      }

      for (const component of clickOutsideChain) {
        const clickOutsideMouseEvent = new MouseEvent({
          mouseRenderPosition,
          mouseCanvasPosition,
          mouseButton: domEvent.button as MouseButton,
          type: "outsideclick",
          target: component,
        });

        this.notifyEventListeners(clickOutsideMouseEvent);

        if (!clickOutsideMouseEvent.shouldPropagate) {
          break;
        }
      }
    });
  }

  private listenMouseDblClick() {
    this.viewport.canvas.addEventListener("dblclick", (domEvent) => {
      const chain: Component[] = [];

      for (const component of this.componentsTree.traverse()) {
        const isColliding = this.mouseComponent.isColliding(component);

        if (!isColliding) continue;

        chain.push(component);
      }

      if (!chain.length) return;
      chain.reverse();

      const rect = this.viewport.canvas.getBoundingClientRect();
      const mouseCanvasPosition = new Vector(
        domEvent.clientX - rect.left,
        domEvent.clientY - rect.top
      );

      const mouseRenderPosition =
        this.viewport.calculateRenderPosition(mouseCanvasPosition);

      for (const component of chain) {
        const dblClickEvent = new MouseEvent({
          mouseRenderPosition,
          mouseCanvasPosition,
          mouseButton: domEvent.button as MouseButton,
          type: "dblclick",
          target: component,
        });

        this.notifyEventListeners(dblClickEvent);

        if (!dblClickEvent.shouldPropagate) {
          break;
        }
      }
    });
  }

  private listenMouseDown() {
    this.viewport.canvas.addEventListener("mousedown", (domEvent) => {
      const chain: Component[] = [];

      for (const currentComponent of this.componentsTree.traverse()) {
        const isColliding = this.mouseComponent.isColliding(currentComponent);

        if (!isColliding) continue;

        chain.push(currentComponent);
      }

      if (!chain.length) return;

      const rect = this.viewport.canvas.getBoundingClientRect();
      const mouseCanvasPosition = new Vector(
        domEvent.clientX - rect.left,
        domEvent.clientY - rect.top
      );

      const mouseRenderPosition =
        this.viewport.calculateRenderPosition(mouseCanvasPosition);

      chain.reverse();

      for (const component of chain) {
        const mouseDownEvent = new MouseEvent({
          mouseRenderPosition,
          mouseCanvasPosition,
          mouseButton: domEvent.button as MouseButton,
          type: "mousedown",
          target: component,
        });

        this.notifyEventListeners(mouseDownEvent);

        if (!mouseDownEvent.shouldPropagate) {
          break;
        }
      }
    });
  }

  private listenMouseUp() {
    this.viewport.canvas.addEventListener("mouseup", (domEvent) => {
      const chain: Component[] = [];

      for (const component of this.componentsTree.traverse()) {
        const isColliding = this.mouseComponent.isColliding(component);

        if (!isColliding) continue;

        chain.push(component);
      }

      if (!chain.length) return;
      chain.reverse();

      const rect = this.viewport.canvas.getBoundingClientRect();
      const mouseCanvasPosition = new Vector(
        domEvent.clientX - rect.left,
        domEvent.clientY - rect.top
      );

      const mouseRenderPosition =
        this.viewport.calculateRenderPosition(mouseCanvasPosition);

      for (const component of chain) {
        const mouseUpEvent = new MouseEvent({
          mouseRenderPosition,
          mouseCanvasPosition,
          mouseButton: domEvent.button as MouseButton,
          type: "mouseup",
          target: component,
        });

        this.notifyEventListeners(mouseUpEvent);

        if (!mouseUpEvent.shouldPropagate) {
          break;
        }
      }
    });
  }

  private listenMouseEnter() {
    // NOT IMPLEMENTED YET
  }

  private listenMouseLeave() {
    // NOT IMPLEMENTED YET
  }

  private listenMouseMove() {
    this.viewport.canvas.addEventListener("mousemove", (domEvent) => {
      const rect = this.viewport.canvas.getBoundingClientRect();
      const mouseCanvasPosition = new Vector(
        domEvent.clientX - rect.left,
        domEvent.clientY - rect.top
      );

      const mouseRenderPosition =
        this.viewport.calculateRenderPosition(mouseCanvasPosition);

      const mouseMoveEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
        type: "mousemove",
        target: this.componentsTree.getRootComponent()!,
      });

      this.notifyEventListeners(mouseMoveEvent);

      if (!mouseMoveEvent.shouldPropagate) {
        console.log(
          `DEV_LOG: mousemove event doesn't support event.stopPropogation as this event fires on root component only!`
        );
      }
    });
  }

  private listenKeyboardDown() {
    window.addEventListener("keydown", (domEvent) => {
      if (
        document.activeElement &&
        document.activeElement instanceof HTMLElement
      ) {
        document.activeElement.blur();
      }

      const keyboardEvent = new KeyboardEvent({
        key: domEvent.key,
        altKey: domEvent.altKey,
        ctrlKey: domEvent.ctrlKey,
        metaKey: domEvent.metaKey,
        shiftKey: domEvent.shiftKey,
        type: "keydown",
      });
      this.notifyEventListeners(keyboardEvent);
    });
  }

  private listenKeyboardUp() {
    window.addEventListener("keyup", (domEvent) => {
      if (
        document.activeElement &&
        document.activeElement instanceof HTMLElement
      ) {
        document.activeElement.blur();
      }

      const keyboardEvent = new KeyboardEvent({
        key: domEvent.key,
        altKey: domEvent.altKey,
        ctrlKey: domEvent.ctrlKey,
        metaKey: domEvent.metaKey,
        shiftKey: domEvent.shiftKey,
        type: "keyup",
      });

      this.notifyEventListeners(keyboardEvent);
    });
  }

  private listenHotKeys() {
    // unbind every single started listenner
    hotkeys.unbind();

    for (const eventName of this.eventListeners.keys()) {
      if (!eventName.startsWith("hotkey-")) {
        return;
      }

      const keys = eventName.split("-")[1];

      hotkeys(keys, (domEvent) => {
        if (
          document.activeElement &&
          document.activeElement instanceof HTMLElement
        ) {
          document.activeElement.blur();
        }

        const hotkeyEvent = new HotKeyEvent({
          type: eventName as unknown as HotKeyEventType,
        });
        this.notifyEventListeners(hotkeyEvent);
      });
    }
  }

  private notifyEventListeners(event: MouseEvent): void;
  private notifyEventListeners(event: KeyboardEvent): void;
  private notifyEventListeners(event: HotKeyEvent): void;
  private notifyEventListeners(event: any) {
    const currentEventListenersOfThisType =
      this.eventListeners.get(event.type) || [];

    for (const cb of currentEventListenersOfThisType) {
      if (!event.shouldPropagate) {
        return;
      }

      cb(event);
    }
  }

  public addEventListener(
    type: MouseEventType,
    cb: MouseEventListenerCallback
  ): () => void;
  public addEventListener(
    type: KeyboardEventType,
    cb: KeyboardEventListenerCallback
  ): () => void;
  public addEventListener(
    type: HotKeyEventType,
    cb: HotKeyEventListenerCallback
  ): () => void;
  public addEventListener(type: any, cb: any): () => void {
    const currentEventListenersOfThisType = this.eventListeners.get(type) || [];
    const isHotKeyEvent = type.startsWith("hotkey-");
    this.eventListeners.set(type, [...currentEventListenersOfThisType, cb]);

    if (isHotKeyEvent) {
      console.log("SOMETHING IS WEIRD!", type);
      // Resubscribe all hotkey events (https://github.com/jaywcjlove/hotkeys-js/issues/90)
      this.listenHotKeys();
    }

    return () => {
      // unsubscribe/remove event listener
      const eventListenersOfThisType = this.eventListeners.get(type) || [];
      this.eventListeners.set(
        type,
        eventListenersOfThisType.filter((fn) => fn !== cb)
      );

      if (isHotKeyEvent) {
        // Resubscribe all hotkey events (https://github.com/jaywcjlove/hotkeys-js/issues/90)
        this.listenHotKeys();
      }
    };
  }

  public static getCurrentInputEventsListener() {
    if (!this.currentInputEventsListener)
      throw new Error(`InputEventsListener not found!`);

    return this.currentInputEventsListener;
  }
}
