import { Text, Color, Vector, TextSelection } from "../atoms";
import { ComponentMode, DrawContext } from "./Component";
import { RectComponent } from "./RectComponent";

export class TextComponent extends RectComponent {
  public text = new Text();
  public color = new Color(0, 0, 0, 1);
  public caretColor = new Color(0, 0, 0, 1);
  public selectionColor = new Color(66, 195, 255, 0.2);
  public placeholderText = "Type something";
  public placeholderColor = new Color(0, 0, 0, 0.2);
  public fontSize = "20px";
  public fontWeight = "normal";
  public selection: TextSelection | null = null;

  public caretIndex = 0;
  public caretBlinkDelay = 0.5; // 0.5 second
  public caretBlinkTimer = 0;
  public shouldDrawCaret = false;

  private calculateSize(context: DrawContext) {
    const textMetrics = this.text.multiLineTextMetrics(
      context.ctx,
      this.placeholderText || "Dummy Text"
    );

    const borderSize = new Vector(
      textMetrics.longestLineMetrics.width,
      (textMetrics.longestLineMetrics.fontBoundingBoxAscent +
        textMetrics.longestLineMetrics.fontBoundingBoxDescent) *
        textMetrics.lines.length
    );

    this.size = borderSize;
  }

  public drawSelection(context: DrawContext) {
    if (!this.selection) return;

    const selectionText = new Text(this.text.getContent());
    const lines = selectionText.getLines();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const isNotSelectedLine = !(
        this.selection.end >= line.startIndex &&
        line.endIndex >= this.selection.start
      );

      if (isNotSelectedLine) {
        continue;
      }

      const lineSelectionStart =
        this.selection.start < line.startIndex
          ? 0
          : this.selection.start - line.startIndex;
      const lineSelectionEnd =
        this.selection.end > line.endIndex
          ? line.content.length
          : line.content.length - (line.endIndex - this.selection.end);

      const lineSelection = new TextSelection(
        lineSelectionStart,
        lineSelectionEnd
      );

      const lineText = new Text(line.content);
      const lineSelectionText = new Text(lineText.getContent(lineSelection));
      const lineSelectionMetrics = lineSelectionText.multiLineTextMetrics(
        context.ctx
      );

      const offsetText =
        lineSelection.start > 0
          ? new Text(
              lineText.getContent(new TextSelection(0, lineSelection.start))
            )
          : "";

      let offsetTextBoxSize: Vector = new Vector(0, 0);

      if (offsetText) {
        const offsetMetrics = offsetText.multiLineTextMetrics(context.ctx);

        offsetTextBoxSize = new Vector(
          offsetMetrics.longestLineMetrics.width,
          (offsetMetrics.longestLineMetrics.fontBoundingBoxAscent +
            offsetMetrics.longestLineMetrics.fontBoundingBoxDescent) *
            offsetMetrics.lines.length
        );
      }

      const boxSize = new Vector(
        lineSelectionMetrics.longestLineMetrics.width,
        (lineSelectionMetrics.longestLineMetrics.fontBoundingBoxAscent +
          lineSelectionMetrics.longestLineMetrics.fontBoundingBoxDescent) *
          lineSelectionMetrics.lines.length
      );

      const renderPosition = context.viewport.calculateRenderPosition(
        new Vector(this.position.x + offsetTextBoxSize.x, this.position.y)
      );

      context.ctx.fillStyle = this.selectionColor.toString();
      context.ctx.fillRect(
        renderPosition.x,
        renderPosition.y + boxSize.y * i,
        boxSize.x,
        boxSize.y
      );
    }
  }

  public drawCursor(context: DrawContext) {
    this.caretBlinkTimer += context.deltaTime;

    if (this.caretBlinkTimer > this.caretBlinkDelay) {
      this.caretBlinkTimer = 0;
      this.shouldDrawCaret = !this.shouldDrawCaret;
    }

    if (this.shouldDrawCaret) {
      const textToCursor = new Text(
        this.text.getContent(new TextSelection(0, this.caretIndex))
      );

      const textMetrics = textToCursor.multiLineTextMetrics(context.ctx);

      const height =
        (textMetrics.lastLineMetrics.fontBoundingBoxAscent +
          textMetrics.lastLineMetrics.fontBoundingBoxDescent) *
        (textMetrics.lines.length - 1);

      const position = new Vector(
        this.position.x +
          (textToCursor.getContent() ? textMetrics.lastLineMetrics.width : 0),
        this.position.y
      );

      context.ctx.fillStyle = this.caretColor.toString();
      const renderPosition = context.viewport.calculateRenderPosition(position);

      context.ctx.fillRect(
        renderPosition.x,
        renderPosition.y + height,
        2,
        textMetrics.lastLineMetrics.fontBoundingBoxAscent +
          textMetrics.lastLineMetrics.fontBoundingBoxDescent
      );
    }
  }

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
    this.calculateSize(context);
    super.draw(context);

    if (!this.text.getContent()) {
      this.drawPlaceholder(context);
    } else {
      this.drawContentText(context);
    }

    if (this.mode === ComponentMode.EDIT) {
      this.drawSelection(context);
      this.drawCursor(context);
    } else {
      this.caretBlinkTimer = 0;
    }
  }
}
