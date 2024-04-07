import { clamp } from "lodash";
import { Vector } from "../atoms";
import { lerp } from "../utils/functions";

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
  private positionChangeSpeed = 120; // 0.12 seconds;
  private positionChangeAnimationId: number | null = null;

  public maxSize = new Vector(13824, 8936);

  public zoomLevel: number;
  private zoomLevelChangeSpeed = 120; // 0.12 seconds
  private zoomLevelChangeAnimationId: number | null = null;

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

  private get maxZoomLevel() {
    const defaultMaxZoomLevel = 2.25;
    return defaultMaxZoomLevel;
  }

  // will be calculated by ratio of the canvas size and the viewport size.
  // for example if the maxSize of the viewport is 2x of the canvas, then min zoom level is 0.5 not higher.
  // This is because to prevent having whitespaces in the canvas
  private get minZoomLevel() {
    const maxInX = this.canvas.width / (this.maxSize.x / 2);
    const maxInY = this.canvas.height / (this.maxSize.y / 2);
    const defaultMinZoomLevel = 0.25;

    return Math.max(maxInX, maxInY, defaultMinZoomLevel);
  }

  private setZoomLevelWithAnimation(newZoomLevel: number) {
    if (this.zoomLevelChangeAnimationId !== null) {
      return; // ignore while animating
    }

    const oldSize = this.size;
    const oldZoomLevel = this.zoomLevel;
    const oldPosition = this.position;
    const oldCenter = new Vector(
      oldPosition.x + oldSize.x / 2,
      oldPosition.y + oldSize.y / 2
    );
    const bounds = this.bounds;

    let startTime = 0;
    const requestAnimation = () => {
      const animationId = requestAnimationFrame((currentTime) => {
        if (!startTime) {
          startTime = currentTime;
        }

        const elapsedTime = currentTime - startTime;
        let t = elapsedTime / this.zoomLevelChangeSpeed;
        t = t < 1 ? t : 1;

        this.zoomLevel = lerp(
          oldZoomLevel,
          clamp(newZoomLevel, this.minZoomLevel, this.maxZoomLevel),
          t
        );

        const newSize = new Vector(
          this.canvas.width / (this.zoomLevel * window.devicePixelRatio),
          this.canvas.height / (this.zoomLevel * window.devicePixelRatio)
        );
        const newCenter = new Vector(
          this.position.x + newSize.x / 2,
          this.position.y + newSize.y / 2
        );

        const pivotChange = new Vector(
          oldCenter.x - newCenter.x,
          oldCenter.y - newCenter.y
        );
        const newPosition = Vector.clamp(
          new Vector(
            this.position.x + pivotChange.x,
            this.position.y + pivotChange.y
          ),
          new Vector(bounds.left, bounds.top),
          new Vector(bounds.right - newSize.x, bounds.bottom - newSize.y)
        );

        this.position = Vector.lerp(oldPosition, newPosition, t);

        if (elapsedTime >= this.zoomLevelChangeSpeed) {
          cancelAnimationFrame(animationId);
          this.zoomLevelChangeAnimationId = null;
        } else {
          requestAnimation();
        }
      });

      this.zoomLevelChangeAnimationId = animationId;
    };

    requestAnimation();
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

  // Aka window size
  public get size(): Vector {
    return new Vector(
      this.canvas.width / (this.zoomLevel * window.devicePixelRatio),
      this.canvas.height / (this.zoomLevel * window.devicePixelRatio)
    );
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

  public setPositionWithAnimation(newPosition: Vector) {
    if (this.positionChangeAnimationId !== null) {
      cancelAnimationFrame(this.positionChangeAnimationId);
    }

    const oldPosition = this.position;
    let startTime = 0;
    const requestAnimation = () => {
      const animationId = requestAnimationFrame((currentTime) => {
        if (!startTime) {
          startTime = currentTime;
        }

        const elapsedTime = currentTime - startTime;
        const t = elapsedTime / this.positionChangeSpeed;

        this.position = Vector.lerp(oldPosition, newPosition, t);

        if (elapsedTime >= this.positionChangeSpeed) {
          cancelAnimationFrame(animationId);
          this.positionChangeAnimationId = null;
        } else {
          requestAnimation();
        }
      });

      this.positionChangeAnimationId = animationId;
    };

    requestAnimation();
  }

  public increaseZoomLevel = (zoomLevelChange: number) => {
    this.setZoomLevelWithAnimation(this.zoomLevel + zoomLevelChange);
  };

  public decreaseZoomLevel = (zoomLevelChange: number) => {
    this.setZoomLevelWithAnimation(this.zoomLevel - zoomLevelChange);
  };

  public static getCurrentViewport() {
    return Viewport.currentViewport;
  }
}
