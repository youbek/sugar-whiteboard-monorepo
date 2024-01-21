import { ComponentsTree, Viewport } from "../rendering";
import { Component, ComponentMode, MouseComponent } from "../components";
import { MouseButton, MouseEvent } from "./MouseEvent";
import { KeyboardEvent } from "./KeyboardEvent";
import { Vector } from "../atoms";

type InputEventsListenerConfig = {
  viewport: Viewport;
  mouseComponent: MouseComponent;
  componentsTree: ComponentsTree;
};

export class InputEventsListener {
  private static currentInputEventsListener: InputEventsListener;
  private viewport: Viewport;
  private mouseComponent: MouseComponent;
  private componentsTree: ComponentsTree;

  constructor(config: InputEventsListenerConfig) {
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

      const clickInsideMouseEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
        mouseButton: domEvent.button as MouseButton,
      });

      for (const component of clickInsideChain) {
        component.handleMouseClickEvent(clickInsideMouseEvent);

        if (!clickInsideMouseEvent.shouldPropagate) {
          return;
        }
      }

      const clickOutsideMouseEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
        mouseButton: domEvent.button as MouseButton,
      });

      for (const component of clickOutsideChain) {
        component.handleMouseClickOutsideEvent(clickOutsideMouseEvent);

        if (!clickOutsideMouseEvent.shouldPropagate) {
          return;
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

      const mouseEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
        mouseButton: domEvent.button as MouseButton,
      });

      for (const component of chain) {
        component.handleMouseDblClickEvent(mouseEvent);

        if (!mouseEvent.shouldPropagate) {
          return;
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

      const mouseEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
        mouseButton: domEvent.button as MouseButton,
      });
      chain.reverse();

      for (const component of chain) {
        component.handleMouseDownEvent(mouseEvent);

        if (!mouseEvent.shouldPropagate) {
          return;
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

      const mouseEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
        mouseButton: domEvent.button as MouseButton,
      });

      for (const component of chain) {
        component.handleMouseUpEvent(mouseEvent);

        if (!mouseEvent.shouldPropagate) {
          return;
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

      const mouseEvent = new MouseEvent({
        mouseRenderPosition,
        mouseCanvasPosition,
      });

      for (const component of this.componentsTree.traverse()) {
        component.handleMouseMoveEvent(mouseEvent);
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

      for (const component of this.componentsTree.traverse()) {
        const keyboardEvent = new KeyboardEvent({
          key: domEvent.key,
          altKey: domEvent.altKey,
          ctrlKey: domEvent.ctrlKey,
          metaKey: domEvent.metaKey,
          shiftKey: domEvent.shiftKey,
        });

        component.handleKeyboardDownEvent(keyboardEvent);
      }
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

      for (const component of this.componentsTree.traverse()) {
        const keyboardEvent = new KeyboardEvent({
          key: domEvent.key,
          altKey: domEvent.altKey,
          ctrlKey: domEvent.ctrlKey,
          metaKey: domEvent.metaKey,
          shiftKey: domEvent.shiftKey,
        });

        component.handleKeyboardUpEvent(keyboardEvent);
      }
    });
  }
}
