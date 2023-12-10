<script setup lang="ts">
  import { Whiteboard, RectComponent, TextComponent, Vector, Color } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";

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
  
  function addText() {
    const textComponent = new TextComponent();
    whiteboard.value.addComponent(textComponent);
  }
</script>

<template>
  <p>This is my innovative canvas!</p>
  <canvas ref="canvasRef" width="700" height="700"></canvas>
  <button @click="addText">Add text</button>
</template>