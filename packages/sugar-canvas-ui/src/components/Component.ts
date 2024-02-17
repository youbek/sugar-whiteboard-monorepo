import { uid } from "uid";
import { Color, Vector } from "../atoms";
import { Viewport } from "../rendering/Viewport";
import { CollisionEngine } from "../physics/CollisionEngine";
import { MouseEvent, KeyboardEvent } from "../events";

export type ComponentBoundary = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

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
  /** @description Component mode changes. Last item the most recent change. */
  private componentModes: ComponentMode[] = [ComponentMode.VIEW];

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
  public selectModeBoundaryColor = new Color(66, 195, 255, 1);

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

  public get boundary(): ComponentBoundary {
    const left = this.position.x - this.pivot.x;
    const right = left + this.size.x;
    const top = this.position.y - this.pivot.y;
    const bottom = top + this.size.y;

    return {
      left,
      right,
      top,
      bottom,
    };
  }

  public getPosition() {
    return this.position;
  }

  public setPosition(position: Vector) {
    this.position = position;
  }

  public isColliding(other: Component): boolean {
    if (this === other) return false;

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

  public removeMode(removingMode: ComponentMode) {
    this.componentModes = this.componentModes.filter(
      (mode) => mode !== removingMode
    );

    if (!this.componentModes) {
      this.componentModes = [ComponentMode.VIEW];
    }
  }

  public setMode(mode: ComponentMode) {
    this.componentModes.push(mode);
  }

  public get mode() {
    return this.componentModes[this.componentModes.length - 1];
  }

  public drawBorders(context: DrawContext) {
    const renderPosition = context.viewport.calculateRenderPosition(
      new Vector(this.boundary.left, this.boundary.top)
    );

    context.ctx.strokeStyle = this.selectModeBoundaryColor.toString();
    context.ctx.strokeRect(
      renderPosition.x,
      renderPosition.y,
      this.size.x,
      this.size.y
    );
  }

  public draw(context: DrawContext): void {
    if (
      this.mode === ComponentMode.SELECT ||
      this.mode === ComponentMode.EDIT
    ) {
      this.drawBorders(context);
    }

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
}
