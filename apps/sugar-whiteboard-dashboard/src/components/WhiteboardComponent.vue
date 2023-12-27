<script setup lang="ts">
  import { Whiteboard } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";
  import IconButtonComponent from "./IconButtonComponent.vue";
  import TextIcon from "../assets/icons/text.svg"

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const whiteboard = computed(() => new Whiteboard());

  watchEffect(() => {
    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);
    }
  });
  
  function addText(event: any) {
    event.preventDefault();
    event.target.blur();

    whiteboard.value.addTextComponent();
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