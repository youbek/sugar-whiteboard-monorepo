import { Component } from "../components";

export class Event {
  public shouldPropagate = true;
  public target: Component | undefined | null;

  public stopPropagation() {
    this.shouldPropagate = false;
  }
}
