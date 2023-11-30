import { Component } from "../components";

export class ComponentsTree {
  private components: Component[] = [];

  constructor(defaultComponents?: Component[]) {
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
}
