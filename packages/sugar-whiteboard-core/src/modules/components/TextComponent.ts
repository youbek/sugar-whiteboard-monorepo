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
    context.ctx.font = `300 ${this.fontSize} sans-serif`;
    context.ctx.fillStyle = this.color.toString();
    this.lastRenderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    context.ctx.font = `300 ${this.fontSize} sans-serif`;
    context.ctx.fillText(
      this.textContent,
      this.lastRenderPosition.x,
      this.lastRenderPosition.y
    );
  }

  public draw(context: DrawContext): void {
    if (!this.textContent) {
      this.drawPlaceholder(context);
    } else {
      this.drawText(context);
    }
  }
}
