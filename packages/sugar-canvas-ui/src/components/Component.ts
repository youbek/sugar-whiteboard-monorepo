import { uid } from "uid";
import { Vector } from "../atoms";
import { Viewport } from "../rendering/Viewport";
import { CollisionEngine } from "../physics/CollisionEngine";
import { MouseEvent, KeyboardEvent } from "../events";

export enum ComponentMode {
  VIEW = "VIEW",
  EDIT = "EDIT",
  SELECT = "SELECT",
}

export type DrawContext = {
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  deltaTime: number;
};

export abstract class Component {
  public id: string;
  public position: Vector = new Vector(0, 0); // world position
  public lastRenderPosition: Vector = new Vector(0, 0); // drawn position relative to last viewport
  public size: Vector = new Vector(0, 0); // in world size (x => width, y => height)
  public scale: number = 1;
  public rotation: number = 0; // radians
  public pivot: Vector = new Vector(0, 0); // top left corner of the component
  public opacity: number = 1;
  public visible: boolean = true;
  public zIndex: number = 0;
  public showDebugInfo: boolean = false;

  public mode: ComponentMode = ComponentMode.VIEW;

  public children: Component[] | null = null;

  constructor() {
    this.id = uid();
    this.lastRenderPosition = this.position;
  }

  public get vertices(): Vector[] {
    return [];
  }

  public get edges(): Vector[] {
    return [];
  }

  public getPosition() {
    return this.position;
  }

  public setPosition(position: Vector) {
    this.position = position;
  }

  public isColliding(other: Component): boolean {
    return CollisionEngine.checkCollision(this, other);
  }

  public addChild(child: Component) {
    if (!this.children) {
      this.children = [child];
    } else {
      this.children.push(child);
    }
  }

  public removeChild(removingChild: Component) {
    if (!this.children?.length) return;

    return (this.children = this.children.filter(
      (child) => removingChild.id !== child.id
    ));
  }

  public getChildren() {
    return this.children;
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

    if (!this.children) return;

    for (const child of this.children) {
      child.draw(context);
    }
  }

  public handleMouseClickEvent(event: MouseEvent) {}

  public handleMouseClickOutsideEvent(event: MouseEvent) {}

  public handleMouseDblClickEvent(event: MouseEvent) {}

  public handleMouseUpEvent(event: MouseEvent) {}

  public handleMouseDownEvent(event: MouseEvent) {}

  public handleMouseMoveEvent(event: MouseEvent) {}

  public handleKeyboardDownEvent(event: KeyboardEvent) {}
}
