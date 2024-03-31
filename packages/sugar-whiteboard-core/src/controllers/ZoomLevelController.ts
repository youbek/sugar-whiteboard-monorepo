import { Viewport } from "sugar-canvas-ui";

import { Controller } from "./Controller";

export class ZoomLevelController extends Controller {
  constructor() {
    super();

    const zoomInHotKeys = "cmd__=";

    this.inputEventsListener.addEventListener(
      `hotkey-${zoomInHotKeys}`,
      this.handleZoomInHotKey.bind(this)
    );

    const zoomOutHotKeys = "cmd__-";

    this.inputEventsListener.addEventListener(
      `hotkey-${zoomOutHotKeys}`,
      this.handleZoomOutHotKey.bind(this)
    );
  }

  private handleZoomInHotKey() {
    const viewport = Viewport.getCurrentViewport();

    viewport.increaseZoomLevel(0.25);
  }

  private handleZoomOutHotKey() {
    const viewport = Viewport.getCurrentViewport();
    console.log("double !");

    viewport.decreaseZoomLevel(0.25);
  }
}
