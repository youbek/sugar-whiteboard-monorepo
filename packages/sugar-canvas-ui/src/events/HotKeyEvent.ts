import { Event } from "./Event";

export type HotKeyEventType = `hotkey-${string}`; // this is dynamic because client code can have custom hotkey events like ctrl+z and ctrl+y or whatever they want!

type HotKeyEventConfig = {
  type: HotKeyEventType;
};

export class HotKeyEvent extends Event {
  type: HotKeyEventType;

  constructor(config: HotKeyEventConfig) {
    super();

    this.type = config.type;
  }
}
