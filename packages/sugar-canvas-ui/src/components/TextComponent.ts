import { Text, Color } from "../atoms";
import { Draggable, TextContentEditable } from "../decorators";
import { DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";

@Draggable()
@TextContentEditable()
export class TextComponent extends RectComponent {
  public text = new Text();
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

    context.ctx.font = `300 ${this.fontSize} monospace`;
    context.ctx.fillText(
      "Type something",
      this.lastRenderPosition.x,
      this.lastRenderPosition.y
    );
  }

  public drawText(context: DrawContext) {
    context.ctx.font = `300 ${this.fontSize} monospace`;
    context.ctx.fillStyle = this.color.toString();

    this.lastRenderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    const {
      longestLineMetrics: { fontBoundingBoxAscent, fontBoundingBoxDescent },
    } = this.text.multiLineTextMetrics(context.ctx);

    const lineHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;

    const lines = this.text.getLines();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      context.ctx.fillText(
        line.content,
        this.lastRenderPosition.x,
        this.lastRenderPosition.y + lineHeight * i
      );
    }
  }

  public draw(context: DrawContext): void {
    if (!this.text.getContent()) {
      this.drawPlaceholder(context);
    } else {
      this.drawText(context);
    }
  }
}
