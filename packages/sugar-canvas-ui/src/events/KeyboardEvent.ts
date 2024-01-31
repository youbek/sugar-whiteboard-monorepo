import { Event } from "./Event";

export type KeyboardEventType = "keydown" | "keyup";

type KeyboardEventConfig = {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  type: KeyboardEventType;
};

export class KeyboardEvent extends Event {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  type: KeyboardEventType;

  constructor(config: KeyboardEventConfig) {
    super();

    this.type = config.type;
    this.key = config.key;
    this.shiftKey = config.shiftKey;
    this.ctrlKey = config.ctrlKey;
    this.metaKey = config.metaKey;
    this.altKey = config.altKey;
  }
}
