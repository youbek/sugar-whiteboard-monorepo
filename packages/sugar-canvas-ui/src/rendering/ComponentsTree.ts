import { Component } from "../components";

export class ComponentsTree {
  private static currentComponentsTree: ComponentsTree;
  private components: Component[] = [];

  constructor(defaultComponents?: Component[]) {
    if (ComponentsTree.currentComponentsTree) {
      throw new Error("Cannot initialize another Viewport, it already exists.");
    }

    ComponentsTree.currentComponentsTree = this;

    this.components = defaultComponents ? defaultComponents : [];
  }

  public getComponents() {
    return this.components;
  }

  public addComponent(component: Component) {
    this.components.push(component);
  }

  public removeComponent(component: Component) {
    this.components = this.components.filter(
      (storedComponent) => storedComponent.id !== component.id
    );
  }

  public getIndex(component: Component) {
    return this.components.findIndex((other) => other === component);
  }

  public static getCurrentComponentsTree() {
    return this.currentComponentsTree;
  }
}
