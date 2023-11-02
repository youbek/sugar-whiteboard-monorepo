import { Vector } from "./atoms";
import { Component } from "./components";
import { ViewportBackgroundComponent } from "./components/ViewportBackgroundComponent";
import { SugarEngine } from "./SugarEngine";
import { Viewport } from "./Viewport";

export class Whiteboard {
  private viewport: Viewport | null = null;
  private engine: SugarEngine | null = null;

  constructor() {}

  public addComponent(component: Component) {
    this.engine?.addComponent(component);
  }

  public removeComponent(component: Component) {
    this.engine?.removeComponent(component.id);
  }

  public init(canvas: HTMLCanvasElement) {
    this.viewport = new Viewport(new Vector(canvas.width, canvas.height));
    this.engine = new SugarEngine(this.viewport, canvas);

    this.engine.addComponent(new ViewportBackgroundComponent());
    this.engine.scheduleDraw();
  }
}
