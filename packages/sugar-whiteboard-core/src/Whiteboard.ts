import { SugarCanvasClientApp } from "sugar-canvas-ui";
import { MainBoardComponent, DrawingComponent } from "./components";
import { DefaultContext, TextContext } from "./contexts";

type WhiteboardContext = DefaultContext | TextContext;

export class Whiteboard {
  private currentContext: WhiteboardContext | null = null;
  private sugarCanvasApp: SugarCanvasClientApp | null = null;

  public setContext<TContext extends WhiteboardContext>(
    Context: new (...args: any[]) => TContext
  ): TContext {
    if (this.currentContext instanceof Context) return this.currentContext;

    this.currentContext?.unmount();

    const context = (this.currentContext = new Context());
    1;

    context.onUnmount(() => {
      this.currentContext = new DefaultContext();
    });

    return context;
  }

  public getContext(): WhiteboardContext {
    if (this.currentContext === null) {
      throw new Error(`Calling getContext before initializing the whiteboard!`);
    }

    return this.currentContext;
  }

  public init(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.sugarCanvasApp = new SugarCanvasClientApp({
      canvas,
      rootComponent: new MainBoardComponent(),
    });

    this.currentContext = new DefaultContext();
  }
}
