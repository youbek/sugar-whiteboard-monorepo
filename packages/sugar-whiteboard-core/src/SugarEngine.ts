import { Viewport } from "./Viewport";
import { Vector } from "./atoms";
import { Component } from "./components";
import { MouseComponent } from "./components/MouseComponent";

export class SugarEngine {
  private viewport: Viewport;
  private canvas: HTMLCanvasElement;
  private components: Component[] = [];
  private renderingId: number | null = null;
  private mouseComponent = new MouseComponent();

  constructor(viewport: Viewport, canvas: HTMLCanvasElement) {
    this.viewport = viewport;
    this.canvas = canvas;
    this.components = [];
    this.renderingId = null;

    this.canvas.addEventListener(
      "mousemove",
      this.handleMouseOnEvent.bind(this)
    );
  }

  private handleMouseOnEvent(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mousePosition = new Vector(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    this.mouseComponent?.setPosition(
      this.viewport.calculateRenderPosition(mousePosition)
    );

    for (const component of this.components) {
      if (component.isColliding(this.mouseComponent)) {
        component.mouseOver.next(undefined);
      } else {
        component.mouseOut.next(undefined);
      }
    }
  }

  private draw(prevFrameEndTime: number) {
    const ctx = this.canvas.getContext("2d");

    if (!ctx) {
      console.warn("Could not get canvas context");
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - prevFrameEndTime;

    for (let component of this.components) {
      component.draw({
        canvas: this.canvas,
        ctx,
        viewport: this.viewport,
        deltaTime,
      });
    }

    this.mouseComponent?.draw({
      canvas: this.canvas,
      ctx,
      viewport: this.viewport,
      deltaTime,
    });

    this.scheduleDraw();
  }

  scheduleDraw() {
    if (this.renderingId) {
      cancelAnimationFrame(this.renderingId);
    }
    this.renderingId = requestAnimationFrame(this.draw.bind(this));
  }

  addComponent(component: Component) {
    console.log("Adding component: ", component);
    this.components.push(component);
  }

  removeComponent(componentId: string) {
    this.components = this.components.filter(
      (component) => component.id !== componentId
    );
  }
}
