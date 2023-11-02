<script setup lang="ts">
  import { Whiteboard, RectComponent, Vector, Color } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const whiteboard = computed(() => new Whiteboard());

  watchEffect(() => {
    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);
    }
  });

  const addRectangle = () => {
    const rectangle = new RectComponent();
    rectangle.size = new Vector(200, 100);
    rectangle.backgroundColor = new Color(255, 0, 0, 1);
    whiteboard.value.addComponent(rectangle);
  };
</script>

<template>
  <p>This is my innovative canvas!</p>
  <canvas ref="canvasRef" width="700" height="700"></canvas>
  <button @click="addRectangle">Add rectangle component</button>
</template>