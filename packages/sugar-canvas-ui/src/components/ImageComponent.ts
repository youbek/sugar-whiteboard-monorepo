import { Vector } from "../atoms";
import { DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";

export type ImageComponentConfig = {
  // This can point to the external resource like https://hips.hearstapps.com/hmg-prod/images/2024-ford-mustang-gt-111-64e6608fce997.jpg
  // Or blob object!
  source: string;
  size: Vector;
  keepAspectRatio?: boolean;
};

export class ImageComponent extends RectComponent {
  private asset: HTMLImageElement;
  private keepAspectRatio: boolean = false;

  constructor(config: ImageComponentConfig) {
    super();

    this.asset = new Image();
    this.asset.src = config.source;

    this.asset.onload = this.handleAssetLoad.bind(this);

    this.size = config.size;
    this.keepAspectRatio = !!config.keepAspectRatio;
  }

  private handleAssetLoad() {
    if (this.keepAspectRatio) {
      this.recalculateSizeBasedOnAspectRatio();
    }
  }

  private recalculateSizeBasedOnAspectRatio() {
    // ignores width or height given and recaluclates size based on aspect ratio of the actual asset size
    const actualSize = new Vector(this.asset.width, this.asset.height);

    if (actualSize.x > actualSize.y) {
      const ratio = actualSize.x / actualSize.y;
      this.size = new Vector(this.size.x, this.size.y / ratio);
    } else {
      const ratio = actualSize.y / actualSize.x;
      this.size = new Vector(this.size.x / ratio, this.size.y);
    }
  }

  public draw(context: DrawContext): void {
    super.draw(context);

    if (!this.asset.complete) return;
    console.log("YES");

    context.ctx.drawImage(
      this.asset,
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    );
  }
}
