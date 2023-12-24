type Selection = {
  start: number; // inclusive
  end: number; // exclusive
};

type MultiLineMetrics = {
  longestLineMetrics: TextMetrics;
  lastLineMetrics: TextMetrics;
  lines: string[];
};

type TextLine = {
  content: string;
  startIndex: number; // startIndex within the whole text. (e.g line 3 the start index will be length of line 1 + \n + length of line 2 + \n)
  endIndex: number; // endIndex within the whole text
  index: number;
};

export class Text {
  private content = "";

  constructor(content?: string) {
    this.content = content || "";
  }

  public getLines(): TextLine[] {
    // TODO: Improve performance: possible tricks are caching, better looping.
    const lines = this.content.split("\n");

    return lines.reduce<TextLine[]>((prevLines, line, lineIndex) => {
      const prevLine = prevLines[prevLines.length - 1];

      prevLines.push({
        content: line,
        startIndex: prevLine ? prevLine.endIndex + 1 : 0,
        endIndex: prevLine ? prevLine.endIndex + 1 + line.length : line.length,
        index: lineIndex,
      });

      return prevLines;
    }, []);
  }

  public setContent(newContent: string) {
    this.content = newContent;
  }

  public getContent(selection?: Selection) {
    if (!selection) return this.content;

    return this.content.substring(0, selection.end);
  }

  public deleteContent(selection: Selection) {
    if (selection.start >= selection.end) {
      throw new Error(
        `Invalid selection: start - ${selection.start} and end - ${selection.end}.\nEnd should be greater than start.\nEnd is exclusive and start is inclusive!`
      );
    }

    const isWholeContent =
      selection.start + selection.end === this.content.length;
    if (isWholeContent) {
      this.content = "";
      return;
    }

    let newContent = "";

    for (let i = 0; i < this.content.length; i++) {
      const isWithinSelection = i >= selection.start && i < selection.end;

      if (isWithinSelection) {
        continue;
      }

      const char = this.content[i];
      newContent += char;
    }

    this.content = newContent;
  }

  public insertContent(content: string, index: number) {
    this.content =
      this.content.slice(0, index) + content + this.content.slice(index);
  }

  public multiLineTextMetrics(
    ctx: CanvasRenderingContext2D,
    defaultText: string = " "
  ): MultiLineMetrics {
    const lines = (this.content || defaultText).split("\n");
    const longestLine =
      lines.reduce(
        (prevLongestLine, line) =>
          line.length > prevLongestLine.length ? line : prevLongestLine,
        ""
      ) || " ";

    const lastLineMetrics = ctx.measureText(lines[lines.length - 1]);
    const longestLineMetrics = ctx.measureText(longestLine);

    const result = {
      longestLineMetrics,
      lastLineMetrics,
      lines,
    };

    return result;
  }
}
