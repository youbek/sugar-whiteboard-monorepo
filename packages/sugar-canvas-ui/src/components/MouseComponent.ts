import { Color, Vector } from "../atoms";
import { Component, DrawContext } from "./Component";
import { Viewport } from "../rendering";

export enum MouseImagePivot {
  TOP_LEFT,
  BOTTOM_LEFT,
}

type MouseImage = {
  source: HTMLImageElement;
  position: MouseImagePivot;
};

export type MouseComponentConfig = {
  defaultCursorImage: string;
};

export class MouseComponent extends Component {
  private static currentMouse: MouseComponent;
  private images: MouseImage[] = [];
  private defaultCursorImage: string;

  public canvasPosition: Vector = new Vector(0, 0);

  constructor(config: MouseComponentConfig) {
    super();

    if (MouseComponent.currentMouse) {
      throw new Error(
        "Cannot initialize another MouseComponent, it already exists."
      );
    }

    this.size = new Vector(24, 24);
    MouseComponent.currentMouse = this;

    this.defaultCursorImage = config.defaultCursorImage;
    this.setImage(this.defaultCursorImage);

    this.zIndex = Number.MAX_SAFE_INTEGER;

    this.syncMouseCanvasPosition();
    this.hideMouseComponentOnCanvasLeave();
  }

  private hideMouseComponentOnCanvasLeave() {
    const viewport = Viewport.getCurrentViewport();
    viewport.canvas.addEventListener("mouseleave", () => {
      this.visible = false;
    });

    viewport.canvas.addEventListener("mouseenter", () => {
      this.visible = true;
    });

    viewport.canvas.addEventListener("mousemove", () => {
      this.visible = true;
    });
  }

  private syncMouseCanvasPosition() {
    const viewport = Viewport.getCurrentViewport();
    viewport.canvas.addEventListener("mousemove", (domEvent) => {
      const rect = viewport.canvas.getBoundingClientRect();
      this.canvasPosition = new Vector(
        (domEvent.clientX - rect.left) / viewport.zoomLevel,
        (domEvent.clientY - rect.top) / viewport.zoomLevel
      );
    });
  }

  private syncMousePositionWithViewport() {
    const viewport = Viewport.getCurrentViewport();
    this.setPosition(
      new Vector(
        this.canvasPosition.x + viewport.position.x,
        this.canvasPosition.y + viewport.position.y
      )
    );
  }

  public setImage(imageSrc: string, position = MouseImagePivot.TOP_LEFT) {
    // if last image is the same image then return early
    const lastImage = this.images.length && this.images[this.images.length - 1];
    if (lastImage && lastImage.source.src === imageSrc) {
      return;
    }

    const image = new Image();
    image.src = imageSrc;

    this.images.push({ source: image, position });
  }

  public removeImage(imageSrc: string) {
    // do not remove default cursor image never!
    if (imageSrc === this.defaultCursorImage) return;

    this.images = this.images.filter((image) => image.source.src !== imageSrc);
  }

  private drawLatestImage(context: DrawContext) {
    if (!this.images.length) {
      throw new Error(
        `DEV_LOG: At least 1 image should be given to the MouseComponent`
      );
    }

    for (let i = this.images.length - 1; i >= 0; i--) {
      const image = this.images[i];

      if (!image.source.complete) continue;

      context.ctx.shadowColor = new Color(56, 56, 56, 0.5).toString();
      context.ctx.shadowBlur = 2;

      let drawPosition = new Vector(0, 0);

      if (image.position === MouseImagePivot.TOP_LEFT) {
        drawPosition = new Vector(this.position.x, this.position.y);
      } else if (image.position === MouseImagePivot.BOTTOM_LEFT) {
        drawPosition = new Vector(
          this.position.x,
          this.position.y - this.size.y / context.viewport.zoomLevel
        );
      }

      context.ctx.drawImage(
        image.source,
        drawPosition.x,
        drawPosition.y,
        this.size.x / context.viewport.zoomLevel,
        this.size.y / context.viewport.zoomLevel
      );

      context.ctx.shadowBlur = 0;

      break;
    }
  }

  public get vertices() {
    return [
      new Vector(this.position.x, this.position.y),
      new Vector(this.position.x + this.size.x, this.position.y),
      new Vector(this.position.x + this.size.x, this.position.y + this.size.y),
      new Vector(this.position.x, this.position.y + this.size.y),
    ];
  }

  public get edges() {
    return [
      Vector.from([this.vertices[0], this.vertices[1]]),
      Vector.from([this.vertices[1], this.vertices[2]]),
      Vector.from([this.vertices[2], this.vertices[3]]),
      Vector.from([this.vertices[3], this.vertices[0]]),
    ];
  }

  public draw(context: DrawContext): void {
    super.draw(context);
    this.syncMousePositionWithViewport();

    // UNCOMMENT TO SEE DEBUG RENDER
    // context.ctx.fillStyle = "red";
    // context.ctx.fillRect(
    //   this.position.x,
    //   this.position.y,
    //   this.size.x * this.scale,
    //   this.size.y * this.scale
    // );

    this.drawLatestImage(context);
  }

  public static getCurrentMouse() {
    return MouseComponent.currentMouse;
  }
}
