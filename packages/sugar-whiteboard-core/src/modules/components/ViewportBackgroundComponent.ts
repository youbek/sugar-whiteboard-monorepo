import { Component, DrawContext } from "./Component";

export class ViewportBackgroundComponent extends Component {
  public isColliding(other: Component): boolean {
    return false;
  }

  public onMouseOver(): void {}

  public onMouseOut(): void {}

  public draw(context: DrawContext): void {
    context.ctx.fillStyle = "#F1F1F1";
    context.ctx.fillRect(
      0,
      0,
      context.viewport.size.x,
      context.viewport.size.y
    );
  }
}
