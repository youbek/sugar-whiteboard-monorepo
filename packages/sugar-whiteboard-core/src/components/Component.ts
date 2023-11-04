import { uid } from "uid";
import { Vector } from "../atoms";
import { Viewport } from "../Viewport";
import { CollisionEngine } from "../CollisionEngine";
import { Subject } from "rxjs";

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
  public showDebugInfo: boolean = false;

  public mouseOver = new Subject();
  public mouseOut = new Subject();

  constructor() {
    this.id = uid();
  }

  public get vertices(): Vector[] {
    return [];
  }

  public get edges(): Vector[] {
    return [];
  }

  public setPosition(position: Vector): void {
    this.position = position;
  }

  public isColliding(other: Component): boolean {
    return CollisionEngine.checkCollision(this, other);
  }

  public draw(context: DrawContext): void {
    if (this.showDebugInfo) {
      for (let i = 0; i < this.vertices.length; i++) {
        const start = this.vertices[i];
        const end = this.vertices[(i + 1) % this.vertices.length];

        const middle = new Vector((start.x + end.x) / 2, (start.y + end.y) / 2);

        const edge = Vector.from([start, end]);

        const perpendicular = edge.perpendicular;

        context.ctx.beginPath();
        context.ctx.arc(start.x, start.y, 10, 0, 2 * Math.PI);
        context.ctx.moveTo(middle.x, middle.y);
        context.ctx.lineTo(
          middle.x + perpendicular.x,
          middle.y + perpendicular.y
        );
        context.ctx.stroke();
      }
    }
  }
}
