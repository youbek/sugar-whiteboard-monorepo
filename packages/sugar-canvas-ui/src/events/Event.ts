export class Event {
  public shouldPropagate = true;

  public stopPropagation() {
    this.shouldPropagate = false;
  }
}
