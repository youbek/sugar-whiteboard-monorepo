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
      const currentComponent = stack.shift();

      if (!currentComponent) break;

      yield currentComponent;

      const children = currentComponent.getChildren();

      if (!children) continue;

      stack.push(...children);
    }
  }

  public static getCurrentComponentsTree() {
    return this.currentComponentsTree;
  }
}
