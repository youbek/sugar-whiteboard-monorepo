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

  public drawText(context: DrawContext, text: Text) {
    this.lastRenderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    const {
      longestLineMetrics: { fontBoundingBoxAscent, fontBoundingBoxDescent },
    } = text.multiLineTextMetrics(context.ctx);

    const lineHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;

    const lines = text.getLines();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      context.ctx.fillText(
        line.content,
        this.lastRenderPosition.x,
        this.lastRenderPosition.y + lineHeight * i + lineHeight
      );
    }
  }

  public drawPlaceholder(context: DrawContext) {
    context.ctx.fillStyle = this.placeholderColor.toString();
    context.ctx.font = `300 ${this.fontSize} monospace`;

    this.drawText(context, new Text("Type something"));
  }

  public drawContentText(context: DrawContext) {
    context.ctx.font = `300 ${this.fontSize} monospace`;
    context.ctx.fillStyle = this.color.toString();

    this.drawText(context, this.text);
  }

  public draw(context: DrawContext): void {
    super.draw(context);

    if (!this.text.getContent()) {
      this.drawPlaceholder(context);
    } else {
      this.drawContentText(context);
    }
  }
}
