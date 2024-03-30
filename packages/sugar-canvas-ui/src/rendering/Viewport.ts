import { Vector } from "../atoms";

type ViewportBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export class Viewport {
  public canvas: HTMLCanvasElement;
  public pivot = new Vector(0, 0); // top left corner of the viewport
  public position: Vector = new Vector(0, 0);
  public maxSize = new Vector(13824, 8936);
  public zoomLevel: number;

  private static currentViewport: Viewport;

  constructor(canvas: HTMLCanvasElement) {
    if (Viewport.currentViewport) {
      throw new Error("Cannot initialize another Viewport, it already exists.");
    }

    Viewport.currentViewport = this;
    this.canvas = canvas;
    this.zoomLevel = 1;

    this.setPosition(new Vector(0, 0));
  }

  public get bounds(): ViewportBounds {
    const maxSize = new Vector(6912, 4468); // 2x of 4K

    return {
      left: -maxSize.x / 2,
      top: -maxSize.y / 2,
      right: maxSize.x / 2,
      bottom: maxSize.y / 2,
    };
  }

  // Aka window size
  public get size(): Vector {
    return new Vector(this.canvas.width, this.canvas.height);
  }

  public getPosition() {
    return this.position;
  }

  public setPosition(newPosition: Vector) {
    const bounds = this.bounds;
    const size = this.size;

    this.position = Vector.clamp(
      new Vector(newPosition.x, newPosition.y),
      new Vector(bounds.left, bounds.top),
      new Vector(bounds.right - size.x, bounds.bottom - size.y)
    );
  }

  public setZoomLevel = (zoomLevel: number) => {
    this.zoomLevel = zoomLevel;
  };

  public calculateRenderPosition = (position: Vector): Vector => {
    return new Vector(
      position.x - this.position.x,
      position.y - this.position.y
    );
  };

  public static getCurrentViewport() {
    return Viewport.currentViewport;
  }
}
