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

    this.viewport.canvas.width = Math.floor(
      this.viewport.canvas.width * window.devicePixelRatio
    );
    this.viewport.canvas.height = Math.floor(
      this.viewport.canvas.height * window.devicePixelRatio
    );
  }

  private draw({ prevFrameEndTime }: DrawOptions) {
    const ctx = this.viewport.canvas.getContext("2d");

    if (!ctx) {
      console.warn("Could not get canvas context");
      return;
    }

    ctx?.reset();
    ctx?.resetTransform();

    console.log(this.viewport.zoomLevel);

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
     */
    ctx?.setTransform({
      a: this.viewport.zoomLevel,
      b: 0,
      c: 0,
      d: this.viewport.zoomLevel,
      e: this.viewport.position.x,
      f: this.viewport.position.y,
    });

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
