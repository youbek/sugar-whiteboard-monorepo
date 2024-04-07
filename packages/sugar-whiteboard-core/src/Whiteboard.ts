import { SugarCanvasClientApp } from "sugar-canvas-ui";
import { MainBoardComponent } from "./components";
import { Context, DefaultContext } from "./contexts";
import { UndoRedoContainer } from "./modules/UndoRedoContainer";
import defaultCursorIcon from "./assets/icons/default.svg";

export class Whiteboard {
  private currentContext: Context | null = null;

  public setContext<TContext extends Context>(
    Context: new (...args: [Whiteboard]) => TContext
  ): TContext {
    // if same context, no need to recreate!
    if (this.currentContext instanceof Context) return this.currentContext;

    this.currentContext?.unmount();

    this.currentContext = new Context(this);

    return this.currentContext as unknown as TContext;
  }

  public getContext(): Context {
    if (this.currentContext === null) {
      throw new Error(`Calling getContext before initializing the whiteboard!`);
    }

    return this.currentContext;
  }

  public init(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    new SugarCanvasClientApp({
      canvas,
      rootComponent: new MainBoardComponent(),
      defaultCursorImage: defaultCursorIcon,
    });

    new UndoRedoContainer();

    this.currentContext = new DefaultContext(this);
  }
}
