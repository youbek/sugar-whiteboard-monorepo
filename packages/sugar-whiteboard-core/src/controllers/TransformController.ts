/**
 * Checks for currently selected components
 * draws transform edit control box around selected components
 * listens for mouse events for dragging and scaling
 */

import { Component, MouseEvent } from "sugar-canvas-ui";
import { TransformControlComponent } from "../components/TransformControlComponent";
import { Controller } from "./Controller";
import { MainBoardComponent } from "../components";

export class TransformController extends Controller {
  private selectedComponents: Component[] = [];

  private reDrawTransformControlComponents() {
    const prevTransformControlComponent =
      this.componentsTree.findComponentOfType(TransformControlComponent);
    if (prevTransformControlComponent)
      this.componentsTree.removeComponent(prevTransformControlComponent);

    if (!this.selectedComponents.length) return;

    const transformControlComponent = new TransformControlComponent({
      components: this.selectedComponents,
    });

    this.componentsTree.addComponent(transformControlComponent);
  }

  private handleSelect(selectedComponents: Component[]) {
    this.selectedComponents = selectedComponents;
    this.reDrawTransformControlComponents();
  }

  private handleDeselect(deselectedComponents: Component[]) {
    const deselectedComponentIds = deselectedComponents.map(({ id }) => id);
    this.selectedComponents = this.selectedComponents.filter(
      (component) => !deselectedComponentIds.includes(component.id)
    );

    this.reDrawTransformControlComponents();
  }

  private handleSingleSelect(event: MouseEvent) {
    event.stopPropagation();

    const clickedComponent = event.target;
    if (clickedComponent && !(clickedComponent instanceof MainBoardComponent)) {
      this.handleSelect([clickedComponent]);
    } else {
      this.handleDeselect(this.selectedComponents); // deselect all components
    }
  }

  private handleRemoveSelectionOnEsc() {
    this.handleDeselect(this.selectedComponents); // deselect all components
  }

  public mount() {
    super.mount();

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        "mouseup",
        this.handleSingleSelect.bind(this)
      )
    );

    this.eventListenerCleanUps.push(
      this.inputEventsListener.addEventListener(
        `hotkey-esc`,
        this.handleRemoveSelectionOnEsc.bind(this)
      )
    );
  }
}
