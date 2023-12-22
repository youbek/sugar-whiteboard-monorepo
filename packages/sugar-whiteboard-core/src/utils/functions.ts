type MultiLineMetrics = {
  longestLineMetrics: TextMetrics;
  lastLineMetrics: TextMetrics;
  lines: string[];
};

export function multiLineTextMetrics(
  ctx: CanvasRenderingContext2D,
  text: string
): MultiLineMetrics {
  const lines = text.split("\n");
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
