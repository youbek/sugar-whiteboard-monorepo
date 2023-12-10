import { Vector } from "./atoms";
import {
  SugarEngine,
  Viewport,
  ViewportComponent,
  Component,
  MouseComponent,
  ComponentsTree,
} from "./modules";

export class Whiteboard {
  private viewport: Viewport | null = null;
  private engine: SugarEngine | null = null;
  private viewportComponent: ViewportComponent | null = null;
  private mouseComponent: MouseComponent | null = null;
  private componentsTree: ComponentsTree;

  constructor() {
    this.componentsTree = new ComponentsTree();
  }

  private fixCanvasBlur(canvas: HTMLCanvasElement) {
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    const scale = window.devicePixelRatio;

    canvas.width = Math.floor(canvas.width * scale);
    canvas.height = Math.floor(canvas.height * scale);

    const ctx = canvas.getContext("2d");
    ctx?.scale(scale, scale);
  }

  public addComponent(component: Component) {
    component.init();
    this.componentsTree?.addComponent(component);
  }

  public removeComponent(component: Component) {
    this.componentsTree?.removeComponent(component);
  }

  public init(canvas: HTMLCanvasElement) {
    this.fixCanvasBlur(canvas);

    this.viewport = new Viewport(new Vector(canvas.width, canvas.height));

    this.viewportComponent = new ViewportComponent();
    this.mouseComponent = new MouseComponent();

    this.addComponent(this.viewportComponent);
    this.addComponent(this.mouseComponent);

    this.engine = new SugarEngine();

    this.engine.scheduleDraw({
      canvas,
      componentsTree: this.componentsTree,
      viewport: this.viewport,
    });
  }
}
