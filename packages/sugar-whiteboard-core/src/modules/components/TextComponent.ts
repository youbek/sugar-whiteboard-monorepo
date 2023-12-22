import { Color } from "../../atoms";
import { Draggable, TextContentEditable } from "../decorators";
import { DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";

@Draggable()
@TextContentEditable()
export class TextComponent extends RectComponent {
  public textContent: string = "";
  public color = new Color(0, 0, 0, 1);
  public placeholderText = "Type something";
  public placeholderColor = new Color(0, 0, 0, 0.2);
  public fontSize = "20px";
  public fontWeight = "normal";

  public drawPlaceholder(context: DrawContext) {
    context.ctx.fillStyle = this.placeholderColor.toString();
    this.lastRenderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    context.ctx.font = `300 ${this.fontSize} sans-serif`;
    context.ctx.fillText(
      "Type something",
      this.lastRenderPosition.x,
      this.lastRenderPosition.y
    );
  }

  public drawText(context: DrawContext) {
    const { fontBoundingBoxAscent, fontBoundingBoxDescent } =
      context.ctx.measureText(this.textContent);

    const lineHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;

    context.ctx.font = `300 ${this.fontSize} sans-serif`;
    context.ctx.fillStyle = this.color.toString();
    this.lastRenderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    const lines = this.textContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];

      context.ctx.font = `300 ${this.fontSize} sans-serif`;
      context.ctx.fillText(
        text,
        this.lastRenderPosition.x,
        this.lastRenderPosition.y + lineHeight * i
      );
    }
  }

  public draw(context: DrawContext): void {
    if (!this.textContent) {
      this.drawPlaceholder(context);
    } else {
      this.drawText(context);
    }
  }
}
