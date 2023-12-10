import { Color, Vector } from "../../atoms";
import { Draggable, TextContentEditable } from "../decorators";
import { ComponentMode, DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";

@Draggable()
@TextContentEditable()
export class TextComponent extends RectComponent {
  public textContent: string = "";
  public color = new Color(0, 0, 0, 1);
  public placeholderColor = new Color(0, 0, 0, 0.2);
  public blinkColor = new Color(0, 0, 0, 1);
  public editBorderColor = new Color(66, 195, 255, 1);
  public fontSize = "20px";
  public fontWeight = "normal";
  public textMetrics: TextMetrics = {
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    width: 0,
  };
  public placeholderText = "Type something";

  private editModePadding = 5;

  private calculateTextMetrics(context: DrawContext) {
    this.textMetrics = context.ctx.measureText(
      this.textContent || this.placeholderText
    );
    this.size = new Vector(
      this.textMetrics.width,
      this.textMetrics.fontBoundingBoxAscent +
        this.textMetrics.fontBoundingBoxDescent
    );
  }

  protected drawBlink(context: DrawContext) {
    const position = new Vector(
      this.position.x - this.textMetrics.actualBoundingBoxLeft,
      this.position.y - this.textMetrics.fontBoundingBoxAscent
    );

    context.ctx.fillStyle = this.blinkColor.toString();
    const renderPosition = context.viewport.calculateRenderPosition(position);

    context.ctx.fillRect(
      renderPosition.x - this.editModePadding,
      renderPosition.y - this.editModePadding,
      2,
      this.size.y + this.editModePadding
    );
  }

  protected drawEditBorder(context: DrawContext) {
    const renderPosition = context.viewport.calculateRenderPosition(
      this.position
    );

    context.ctx.strokeStyle = this.editBorderColor.toString();
    context.ctx.strokeRect(
      renderPosition.x - this.editModePadding,
      renderPosition.y -
        this.textMetrics.fontBoundingBoxAscent -
        this.editModePadding,
      this.size.x + this.editModePadding,
      this.size.y + this.editModePadding
    );
  }

  protected drawPlaceholder(context: DrawContext) {
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

  protected drawText(context: DrawContext) {
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

    this.calculateTextMetrics(context);

    if (this.mode === ComponentMode.EDIT) {
      this.drawEditBorder(context);
      this.drawBlink(context);
    }
  }
}
