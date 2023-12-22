<script setup lang="ts">
  import { Whiteboard, RectComponent, TextComponent, Vector, Color } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";
  import IconButtonComponent from "./IconButtonComponent.vue";
  import TextIcon from "../assets/icons/text.svg"

  // trash code
  const redRectangle = new RectComponent();

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const whiteboard = computed(() => new Whiteboard());

  watchEffect(() => {
    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);

      redRectangle.size = new Vector(200, 100);
      redRectangle.position = new Vector(100, 100);
      redRectangle.backgroundColor = new Color(255, 0, 0, 1);
      redRectangle.showDebugInfo = true;

      whiteboard.value.addComponent(redRectangle);

      // redRectangle.mouseOver.subscribe(() => {
      //   redRectangle.backgroundColor = new Color(0, 0, 255, 1);
      // });

      // redRectangle.mouseOut.subscribe(() => {
      //   redRectangle.backgroundColor = new Color(255, 0, 0, 1);
      // });

      // redRectangle.mouseClick.subscribe(() => {
      //   alert("YOU CLICKED ME!");
      // });
    }
  });
  
  function addText(event: any) {
    event.preventDefault();
    event.target.blur();

    const textComponent = new TextComponent();
    whiteboard.value.addComponent(textComponent);
  }
</script>

<template>
  <canvas ref="canvasRef"></canvas>
  <div class="fixed top-0 pointer-events-none">
    <div class="h-screen flex items-center px-2 pointer-events-none">
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="addText"><TextIcon /></IconButtonComponent>
    </div>
  </div>
</template>