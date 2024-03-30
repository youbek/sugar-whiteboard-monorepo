/**
 * Schedules component tree draw event
 * Optimizes like what to rendering depending on the viewport and zoom level
 */

import { Viewport } from "./Viewport";
import { ComponentsTree } from "./ComponentsTree";

type SugarEngineConfig = {
  viewport: Viewport;
  componentsTree: ComponentsTree;
};

type DrawOptions = {
  prevFrameEndTime: number;
};

export class SugarEngine {
  private lastDrawTime: number | null = null;
  private renderingId: number | null = null;
  private viewport: Viewport;
  private componentsTree: ComponentsTree;

  constructor(config: SugarEngineConfig) {
    this.renderingId = null;
    this.viewport = config.viewport;
    this.componentsTree = config.componentsTree;

    this.fixCanvas();
  }

  private fixCanvas() {
    this.viewport.canvas.style.userSelect = "none";

    this.viewport.canvas.style.width = `${this.viewport.canvas.width}px`;
    this.viewport.canvas.style.height = `${this.viewport.canvas.height}px`;
    const scale = window.devicePixelRatio;

    this.viewport.canvas.width = Math.floor(this.viewport.canvas.width * scale);
    this.viewport.canvas.height = Math.floor(
      this.viewport.canvas.height * scale
    );

    const ctx = this.viewport.canvas.getContext("2d");
    ctx?.scale(scale, scale);
  }

  private draw({ prevFrameEndTime }: DrawOptions) {
    const ctx = this.viewport.canvas.getContext("2d");

    if (!ctx) {
      console.warn("Could not get canvas context");
      return;
    }

    let deltaTime = 0;

    if (!this.lastDrawTime) {
      this.lastDrawTime = prevFrameEndTime;
    } else {
      deltaTime = (prevFrameEndTime - this.lastDrawTime) / 1000;
      this.lastDrawTime = prevFrameEndTime;
    }

    for (const component of this.componentsTree.traverse()) {
      component.draw({
        ctx,
        viewport: this.viewport,
        deltaTime,
      });
    }

    this.scheduleDraw();
  }

  scheduleDraw() {
    if (this.renderingId) {
      cancelAnimationFrame(this.renderingId);
    }

    this.renderingId = requestAnimationFrame((prevFrameEndTime) =>
      this.draw.call(this, {
        prevFrameEndTime,
      })
    );
  }
}
