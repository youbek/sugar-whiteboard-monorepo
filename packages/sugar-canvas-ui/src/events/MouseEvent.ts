import { Component } from "../components";
import { Vector } from "../atoms";
import { Event } from "./Event";

export type MouseButton = 0 | 1 | 2;

export type MouseEventType =
  | "click"
  | "dblclick"
  | "outsideclick"
  | "mousedown"
  | "mouseup"
  | "mousemove";

type MouseEventConfig = {
  mouseRenderPosition: Vector;
  mouseCanvasPosition: Vector;
  mouseButton?: MouseButton;
  type: MouseEventType;
  target: Component;
};

export class MouseEvent extends Event {
  public type: MouseEventType;
  public mouseRenderPosition: Vector;
  public mouseCanvasPosition: Vector;
  public mouseButton?: 0 | 1 | 2;
  public target: Component;

  constructor(config: MouseEventConfig) {
    super();

    this.target = config.target;
    this.type = config.type;
    this.mouseRenderPosition = config.mouseRenderPosition;
    this.mouseCanvasPosition = config.mouseCanvasPosition;
    this.mouseButton = config.mouseButton;
  }
}
