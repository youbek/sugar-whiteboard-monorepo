import {
  Color,
  Component,
  DrawContext,
  RectComponent,
  Vector,
} from "sugar-canvas-ui";

export enum TransformScaleControlComponentType {
  TOP_LEFT,
  BOTTOM_LEFT,
  TOP_RIGHT,
  BOTTOM_RIGHT,
}

export type TransformScaleControlComponentConfig = {
  type: TransformScaleControlComponentType;
  position: Vector;
  size: Vector;
};

export class TransformScaleControlComponent extends RectComponent {
  public type: TransformScaleControlComponentType;
  public backgroundColor = new Color(255, 255, 255, 1);
  private borderColor = new Color(45, 45, 45, 1);

  constructor(config: TransformScaleControlComponentConfig) {
    super();

    this.type = config.type;
    this.position = config.position;
    this.size = config.size;
  }

  public draw(context: DrawContext): void {
    context.ctx.fillStyle = this.backgroundColor.toString();

    context.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.x * this.scale,
      this.size.y * this.scale
    );

    context.ctx.strokeStyle = this.borderColor.toString();
    context.ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    );
  }
}
