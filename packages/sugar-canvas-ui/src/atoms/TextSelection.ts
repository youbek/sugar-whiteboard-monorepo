export class TextSelection {
  public start = 0;
  public end = 0;

  constructor(start: number, end: number) {
    if (start > end) {
      this.start = end;
      this.end = start;
    } else {
      this.start = start;
      this.end = end;
    }
  }

  public containsIndex(index: number) {
    return index >= this.start && index < this.end;
  }
}
