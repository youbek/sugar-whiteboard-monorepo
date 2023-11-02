import { uid } from "uid";
import { Vector } from "../atoms";
import { Color } from "src/atoms/Color";
import { Viewport } from "src/Viewport";

export type DrawContext = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  deltaTime: number;
};

export abstract class Component {
  public id: string;
  public position: Vector = new Vector(0, 0); // world position
  public size: Vector = new Vector(0, 0); // in world size (x => width, y => height)
  public scale: number = 1;
  public rotation: number = 0; // radians
  public pivot: Vector = new Vector(0, 0); // top left corner of the component
  public opacity: number = 1;
  public visible: boolean = true;
  public zIndex: number = 0;

  constructor() {
    this.id = uid();
  }

  public onMouseOver(): void {}
  public onMouseOut(): void {}
  public abstract draw(context: DrawContext): void;
}
