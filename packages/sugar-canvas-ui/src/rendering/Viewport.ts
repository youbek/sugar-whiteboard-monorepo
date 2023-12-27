import { Vector } from "../atoms";

type ViewportBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export class Viewport {
  public pivot = new Vector(0, 0); // top left corner of the viewport
  public position: Vector;
  public size: Vector; // canvas size
  public maxSize = new Vector(13824, 8936);
  public zoomLevel: number;

  private static currentViewport: Viewport;

  constructor(size: Vector) {
    if (Viewport.currentViewport) {
      throw new Error("Cannot initialize another Viewport, it already exists.");
    }

    Viewport.currentViewport = this;

    this.position = new Vector(0, 0);
    this.size = size;
    this.zoomLevel = 1;
  }

  public get bounds(): ViewportBounds {
    const maxSize = new Vector(6912, 4468); // 2x of 4K

    return {
      left: -maxSize.x,
      top: -maxSize.y,
      right: maxSize.x,
      bottom: maxSize.y,
    };
  }

  public getPosition() {
    return this.position;
  }

  public setPosition(newPosition: Vector) {
    const bounds = this.bounds;
    this.position = Vector.clamp(
      newPosition,
      new Vector(bounds.left, bounds.top),
      new Vector(bounds.right, bounds.bottom)
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
