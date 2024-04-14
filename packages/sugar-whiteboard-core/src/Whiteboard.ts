import { SugarCanvasClientApp } from "sugar-canvas-ui";
import { MainBoardComponent } from "./components";
import { Context, DefaultContext } from "./contexts";
import { UndoRedoContainer } from "./modules/UndoRedoContainer";
import defaultCursorIcon from "./assets/icons/default.svg";

type ContextChangeEventHandlerInfo = {
  newContext: Context | null;
};
type ContextChangeEventHandler = (info: ContextChangeEventHandlerInfo) => any;
export class Whiteboard {
  private currentContext: Context | null = null;
  private contextChangeListeners: ContextChangeEventHandler[] = [];

  private notifyContextChange() {
    console.log("SHIUT: ", this.contextChangeListeners);
    this.contextChangeListeners.forEach((listener) =>
      listener({
        newContext: this.currentContext,
      })
    );
  }

  public unmount() {
    this.currentContext?.unmount();
  }

  public onContextChange(handler: ContextChangeEventHandler) {
    this.contextChangeListeners.push(handler);

    console.log(this.contextChangeListeners);
  }

  public setContext<TContext extends Context>(
    Context: new (...args: [Whiteboard]) => TContext
  ): TContext {
    // if same context, no need to recreate!
    if (this.currentContext instanceof Context) return this.currentContext;

    this.currentContext?.unmount();

    this.currentContext = new Context(this);

    this.notifyContextChange();

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

    this.setContext(DefaultContext);
  }
}
