import { Component } from "../components";

export class ComponentsTree {
  private static currentComponentsTree: ComponentsTree;
  private root: Component | null = null;

  constructor(root: Component) {
    if (ComponentsTree.currentComponentsTree) {
      throw new Error(
        "Cannot initialize another ComponentsTree, it already exists."
      );
    }

    ComponentsTree.currentComponentsTree = this;
    this.root = root;
  }

  public getRootComponent() {
    return this.root;
  }

  public addComponent(component: Component) {
    this.root?.addChild(component);
  }

  public removeComponent(component: Component) {
    this.root?.removeChild(component);
  }

  public *traverse() {
    if (!this.root) return;

    let stack: Component[] = [this.root];

    while (stack.length) {
      // TODO: Improve if possible or if necessary, sort the stack based on z-index before traversing
      stack.sort((a, b) => a.zIndex - b.zIndex);

      const currentComponent = stack.shift();

      if (!currentComponent) break;

      yield currentComponent;

      const children = currentComponent.getChildren();

      if (!children) continue;

      stack.push(...children);
    }
  }

  // TODO: Improve this to be O(1)
  public findComponentById<T extends Component>(id: string): T | null {
    for (const component of this.traverse()) {
      if (component.id === id) {
        return component as unknown as T;
      }
    }

    return null;
  }

  public findComponentOfType<T extends Component>(
    Type: new (...args: any[]) => T
  ): T | null {
    for (const component of this.traverse()) {
      if (component instanceof Type) {
        return component as unknown as T;
      }
    }

    return null;
  }

  public findComponentsOfType<T extends Component>(
    Type: new (...args: any[]) => T
  ): T[] {
    const components: T[] = [];
    for (const component of this.traverse()) {
      if (component instanceof Type) {
        components.push(component);
      }
    }

    return components;
  }

  public static getCurrentComponentsTree() {
    return this.currentComponentsTree;
  }
}
