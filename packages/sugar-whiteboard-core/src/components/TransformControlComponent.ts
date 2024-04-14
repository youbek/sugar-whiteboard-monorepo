import {
  Color,
  Component,
  ComponentBoundary,
  DrawContext,
  RectComponent,
  Vector,
} from "sugar-canvas-ui";
import {
  TransformScaleControlComponent,
  TransformScaleControlComponentConfig,
  TransformScaleControlComponentType,
} from "./TransformScaleControlComponent";

type TransformControlComponentConfig = {
  components: Component[]; // components that this transform is applied to.
};

export class TransformControlComponent extends RectComponent {
  private padding = new Vector(20, 20);
  private borderColor: Color = new Color(66, 195, 255, 1);

  constructor(config: TransformControlComponentConfig) {
    super();

    this.children = config.components;

    this.calculatePosition();
    this.calculateSize();

    this.attachScaleControls();

    this.zIndex = Number.MAX_SAFE_INTEGER - 100;
  }

  private get boundaryWithPadding() {
    const boundary = this.boundary;

    return {
      left: boundary.left - this.padding.x,
      right: boundary.right + this.padding.x,
      bottom: boundary.bottom + this.padding.y,
      top: boundary.top - this.padding.y,
    };
  }

  private calculatePosition() {
    if (!this.children.length) return;

    const position = new Vector(
      this.children[0].position.x,
      this.children[0].position.y
    );

    this.children.forEach((component) => {
      if (component.position.x < position.x) {
        position.x = component.position.x;
      }

      if (component.position.y < position.y) {
        position.y = component.position.y;
      }
    });

    this.position = position;
  }

  private calculateSize() {
    if (!this.children.length) return;

    if (!this.children.length)
      return {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      };

    const boundary: ComponentBoundary = {
      left: this.children[0].position.x,
      right: this.children[0].position.x + this.children[0].size.x,
      top: this.children[0].position.y,
      bottom: this.children[0].position.y + this.children[0].size.y,
    };

    this.children.forEach((component) => {
      if (component.position.x < boundary.left) {
        boundary.left = component.position.x;
      }

      if (component.position.x + component.size.x > boundary.right) {
        boundary.right = component.position.x + component.size.x;
      }

      if (component.position.y < boundary.top) {
        boundary.top = component.position.y;
      }

      if (component.position.y + component.size.y > boundary.bottom) {
        boundary.bottom = component.position.y + component.size.y;
      }
    });

    this.size = new Vector(
      boundary.right - boundary.left,
      boundary.bottom - boundary.top
    );
  }

  private attachScaleControls() {
    const scaleControlSize = new Vector(10, 10);
    const boundary = this.boundaryWithPadding;
    const scaleControlConfigs: TransformScaleControlComponentConfig[] = [
      {
        type: TransformScaleControlComponentType.TOP_LEFT,
        position: new Vector(
          boundary.left - scaleControlSize.x / 2,
          boundary.top - scaleControlSize.y / 2
        ),
        size: scaleControlSize,
      },
      {
        type: TransformScaleControlComponentType.TOP_RIGHT,
        position: new Vector(
          boundary.right - scaleControlSize.x / 2,
          boundary.top - scaleControlSize.y / 2
        ),
        size: scaleControlSize,
      },
      {
        type: TransformScaleControlComponentType.BOTTOM_LEFT,
        position: new Vector(
          boundary.left - scaleControlSize.x / 2,
          boundary.bottom - scaleControlSize.y / 2
        ),
        size: scaleControlSize,
      },
      {
        type: TransformScaleControlComponentType.BOTTOM_RIGHT,
        position: new Vector(
          boundary.right - scaleControlSize.x / 2,
          boundary.bottom - scaleControlSize.y / 2
        ),
        size: scaleControlSize,
      },
    ];

    const scaleControls = scaleControlConfigs.map(
      (config) => new TransformScaleControlComponent(config)
    );

    scaleControls.forEach((control) => this.addChild(control));
  }

  drawBorder(context: DrawContext) {
    context.ctx.strokeStyle = this.borderColor.toString();
    context.ctx.strokeRect(
      this.position.x - this.padding.x,
      this.position.y - this.padding.y,
      this.size.x + this.padding.x * 2,
      this.size.y + this.padding.y * 2
    );
  }

  draw(context: DrawContext): void {
    this.drawBorder(context);
  }
}
