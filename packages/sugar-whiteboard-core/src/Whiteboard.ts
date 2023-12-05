import { Vector } from "./atoms";
import {
  SugarEngine,
  Viewport,
  ViewportBackgroundComponent,
  Component,
  MouseComponent,
  ComponentsTree,
} from "./modules";
import { EventManager } from "./modules/events/EventManager";

export class Whiteboard {
  private viewport: Viewport | null = null;
  private engine: SugarEngine | null = null;
  private eventManager: EventManager | null = null;

  private viewportBackgroundComponent: ViewportBackgroundComponent;
  private mouseComponent: MouseComponent;
  private componentsTree: ComponentsTree;

  constructor() {
    this.viewportBackgroundComponent = new ViewportBackgroundComponent();
    this.mouseComponent = new MouseComponent();
    this.componentsTree = new ComponentsTree([
      this.viewportBackgroundComponent,
    ]);
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
    this.componentsTree?.addComponent(component);
  }

  public removeComponent(component: Component) {
    this.componentsTree?.removeComponent(component);
  }

  public init(canvas: HTMLCanvasElement) {
    this.fixCanvasBlur(canvas);

    this.viewport = new Viewport(new Vector(canvas.width, canvas.height));
    this.engine = new SugarEngine();
    this.eventManager = new EventManager(
      canvas,
      this.mouseComponent,
      this.componentsTree,
      this.viewport
    );

    this.engine.scheduleDraw({
      canvas,
      componentsTree: this.componentsTree,
      viewport: this.viewport,
    });
  }
}
