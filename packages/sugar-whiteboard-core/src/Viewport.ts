import { Vector } from "./atoms";

export class Viewport {
  public pivot = new Vector(0, 0); // top left corner of the viewport
  public position: Vector;
  public size: Vector;
  public zoomLevel: number;

  constructor(size: Vector) {
    this.position = new Vector(0, 0);
    this.size = size;
    this.zoomLevel = 1;
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
}
