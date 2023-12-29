import { Event } from "./Event";

type KeyboardEventConfig = {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
};

export class KeyboardEvent extends Event {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;

  constructor(config: KeyboardEventConfig) {
    super();

    this.key = config.key;
    this.shiftKey = config.shiftKey;
    this.ctrlKey = config.ctrlKey;
    this.metaKey = config.metaKey;
    this.altKey = config.altKey;
  }
}
