<script setup lang="ts">
  import { Whiteboard, RectComponent, Vector, Color } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";

  // trash code
  const redRectangle = new RectComponent();
  const greenRectangle = new RectComponent();

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const whiteboard = computed(() => new Whiteboard());

  watchEffect(() => {
    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);

      redRectangle.size = new Vector(200, 100);
      redRectangle.position = new Vector(100, 100);
      redRectangle.backgroundColor = new Color(255, 0, 0, 1);
      redRectangle.showDebugInfo = true;

      greenRectangle.size = new Vector(50, 200);
      greenRectangle.backgroundColor = new Color(0, 255, 0, 1);

      whiteboard.value.addComponent(redRectangle);
      whiteboard.value.addComponent(greenRectangle);

      
      redRectangle.mouseOver.subscribe(() => {
        redRectangle.backgroundColor = new Color(0, 0, 255, 1);
      });

      redRectangle.mouseOut.subscribe(() => {
        redRectangle.backgroundColor = new Color(255, 0, 0, 1);
      });

      redRectangle.mouseClick.subscribe(() => {
        alert("YOU CLICKED ME!");
      });
    }
  });

  function moveLeft() {
    redRectangle.position = new Vector(redRectangle.position.x - 10, redRectangle.position.y);
  }

  function moveUp() {
    redRectangle.position = new Vector(redRectangle.position.x, redRectangle.position.y - 10);
  }

  function moveDown() {
    redRectangle.position = new Vector(redRectangle.position.x, redRectangle.position.y + 10);
  }

  function moveRight() {
    redRectangle.position = new Vector(redRectangle.position.x + 10, redRectangle.position.y);
  }

</script>

<template>
  <p>This is my innovative canvas!</p>
  <canvas ref="canvasRef" width="700" height="700"></canvas>
  <button @click="moveLeft">Move Left</button>
  <button @click="moveUp">Move Up</button>
  <button @click="moveDown">Move Down</button>
  <button @click="moveRight">Move Righ</button>
</template>