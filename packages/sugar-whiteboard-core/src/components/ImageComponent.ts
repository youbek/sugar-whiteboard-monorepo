/**
 * This component polishing touches such as border to the BaseImageComponent provided by sugar-canvas-ui
 */

import {
  ImageComponent as BaseImageComponent,
  Color,
  DrawContext,
  ImageComponentConfig,
  RectComponent,
} from "sugar-canvas-ui";

export class ImageComponent extends BaseImageComponent {
  private borderWidth = 50;

  constructor(config: ImageComponentConfig) {
    super(config);
  }

  drawBackgroundPaper(context: DrawContext) {
    context.ctx.shadowColor = new Color(56, 56, 56, 0.05).toString();
    context.ctx.shadowBlur = 5;

    context.ctx.fillStyle = "white";
    context.ctx.fillRect(
      this.position.x - this.borderWidth / 4,
      this.position.y - this.borderWidth / 4,
      this.size.x + this.borderWidth / 2,
      this.size.y + this.borderWidth / 2
    );
  }

  draw(context: DrawContext): void {
    this.drawBackgroundPaper(context);

    super.draw(context);
  }
}
