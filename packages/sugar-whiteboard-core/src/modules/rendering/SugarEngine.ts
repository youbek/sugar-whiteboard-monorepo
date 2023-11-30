/**
 * Schedules component tree draw event
 * Optimizes like what to rendering depending on the viewport and zoom level
 */

import { Viewport } from "./Viewport";
import { ComponentsTree } from "./ComponentsTree";

type ScheduleDrawOptions = {
  canvas: HTMLCanvasElement;
  componentsTree: ComponentsTree;
  viewport: Viewport;
};

type DrawOptions = ScheduleDrawOptions & {
  prevFrameEndTime: number;
};

export class SugarEngine {
  private renderingId: number | null = null;

  constructor() {
    this.renderingId = null;
  }

  private draw({
    canvas,
    componentsTree,
    viewport,
    prevFrameEndTime,
  }: DrawOptions) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.warn("Could not get canvas context");
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - prevFrameEndTime;

    for (let component of componentsTree.getComponents()) {
      component.draw({
        canvas: canvas,
        ctx,
        viewport: viewport,
        deltaTime,
      });
    }

    this.scheduleDraw({
      canvas,
      componentsTree,
      viewport,
    });
  }

  scheduleDraw(options: ScheduleDrawOptions) {
    if (this.renderingId) {
      cancelAnimationFrame(this.renderingId);
    }

    this.renderingId = requestAnimationFrame((prevFrameEndTime) =>
      this.draw.call(this, {
        ...options,
        prevFrameEndTime,
      })
    );
  }
}
