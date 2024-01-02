import {
  Component,
  TextComponent,
  SugarCanvasClientApp,
  DrawingComponent,
} from "sugar-canvas-ui";
import { MainBoardComponent } from "./components";

export class Whiteboard {
  private sugarCanvasApp: SugarCanvasClientApp | null = null;

  public addTextComponent() {
    const textComponent = new TextComponent();
    this.addComponent(textComponent);
  }

  public addDrawingComponent() {
    const drawingComponent = new DrawingComponent();
    this.addComponent(drawingComponent);
  }

  public addComponent(component: Component) {
    this.sugarCanvasApp?.addComponent(component);
  }

  public removeComponent(component: Component) {
    this.sugarCanvasApp?.removeComponent(component);
  }

  public init(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.sugarCanvasApp = new SugarCanvasClientApp({
      canvas,
      rootComponent: new MainBoardComponent(),
    });
  }
}
