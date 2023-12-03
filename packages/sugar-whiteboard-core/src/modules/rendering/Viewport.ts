import { Subject } from "rxjs";
import { Vector } from "../../atoms";

type MouseDragData = {
  mouseX: number;
  mouseY: number;
};
export class Viewport {
  public pivot = new Vector(0, 0); // top left corner of the viewport
  public position: Vector;
  public size: Vector;
  public zoomLevel: number;

  public mouseDragStart = new Subject<MouseDragData>();
  public mouseDrag = new Subject<MouseDragData>();
  public mouseDragEnd = new Subject<MouseDragData>();

  constructor(size: Vector) {
    this.position = new Vector(0, 0);
    this.size = size;
    this.zoomLevel = 1;

    this.handleDrag();
  }

  private handleDrag() {
    let mouseStart = new Vector(0, 0);
    let startPosition = this.position;

    this.mouseDragStart.subscribe(({ mouseX, mouseY }) => {
      mouseStart = new Vector(mouseX, mouseY);
      startPosition = this.position;
    });

    this.mouseDrag.subscribe(({ mouseX, mouseY }) => {
      const moveChange = new Vector(
        mouseX - mouseStart.x,
        mouseY - mouseStart.y
      );

      this.position = new Vector(
        startPosition.x - moveChange.x,
        startPosition.y - moveChange.y
      );
    });

    this.mouseDragEnd.subscribe(({ mouseX, mouseY }) => {
      const moveChange = new Vector(
        mouseX - mouseStart.x,
        mouseY - mouseStart.y
      );

      this.position = new Vector(
        startPosition.x - moveChange.x,
        startPosition.y - moveChange.y
      );
    });
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
