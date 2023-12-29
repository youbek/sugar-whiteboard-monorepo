import {
  Component,
  TextComponent,
  SugarCanvasClientApp,
} from "sugar-canvas-ui";
import { MainBoardComponent } from "./components";

export class Whiteboard {
  private sugarCanvasApp: SugarCanvasClientApp | null = null;

  public addTextComponent() {
    const textComponent = new TextComponent();
    this.addComponent(textComponent);
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
