import { Vector } from "../atoms";
import { Event } from "./Event";

export type MouseButton = 0 | 1 | 2;

type MouseEventConfig = {
  mouseRenderPosition: Vector;
  mouseCanvasPosition: Vector;
  mouseButton?: MouseButton;
};

export class MouseEvent extends Event {
  public mouseRenderPosition: Vector;
  public mouseCanvasPosition: Vector;
  public mouseButton?: 0 | 1 | 2;

  public name = "";

  constructor(config: MouseEventConfig) {
    super();

    this.mouseRenderPosition = config.mouseRenderPosition;
    this.mouseCanvasPosition = config.mouseCanvasPosition;
    this.mouseButton = config.mouseButton;
  }
}
