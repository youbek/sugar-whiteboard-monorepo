import { InputEventsListener } from "../events";
import { Component, MouseComponent } from "../components";
import { ComponentsTree, SugarEngine, Viewport } from "../rendering";

type SugarCanvasAppConfig = {
  canvas: HTMLCanvasElement;
  rootComponent: Component;
  defaultCursorImage: string;
};

export class SugarCanvasClientApp {
  private canvas: HTMLCanvasElement;
  private viewport: Viewport;
  private componentsTree: ComponentsTree;

  constructor(config: SugarCanvasAppConfig) {
    this.canvas = config.canvas;

    this.viewport = new Viewport(this.canvas);
    this.componentsTree = new ComponentsTree(config.rootComponent);
    const mouseComponent = new MouseComponent({
      defaultCursorImage: config.defaultCursorImage,
    });
    this.componentsTree.addComponent(mouseComponent);

    const inputEventsListener = new InputEventsListener({
      viewport: this.viewport,
      componentsTree: this.componentsTree,
      mouseComponent,
    });

    inputEventsListener.init();

    const engine = new SugarEngine({
      componentsTree: this.componentsTree,
      viewport: this.viewport,
    });

    engine.scheduleDraw();
  }
}
