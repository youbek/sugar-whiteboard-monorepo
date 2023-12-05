import { Subject, max } from "rxjs";
import { Vector } from "../../atoms";

type MouseDragData = {
  mouseX: number;
  mouseY: number;
};

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

  public mouseDragStart = new Subject<MouseDragData>();
  public mouseDrag = new Subject<MouseDragData>();
  public mouseDragEnd = new Subject<MouseDragData>();

  constructor(size: Vector) {
    this.position = new Vector(0, 0);
    this.size = size;
    this.zoomLevel = 1;

    this.handleDrag();
  }

  private setPosition(newPosition: Vector) {
    const bounds = this.bounds;
    this.position = Vector.clamp(
      newPosition,
      new Vector(bounds.left, bounds.top),
      new Vector(bounds.right, bounds.bottom)
    );
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

      this.setPosition(
        new Vector(
          startPosition.x - moveChange.x,
          startPosition.y - moveChange.y
        )
      );
    });

    this.mouseDragEnd.subscribe(({ mouseX, mouseY }) => {
      const moveChange = new Vector(
        mouseX - mouseStart.x,
        mouseY - mouseStart.y
      );

      this.setPosition(
        new Vector(
          startPosition.x - moveChange.x,
          startPosition.y - moveChange.y
        )
      );
    });
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
