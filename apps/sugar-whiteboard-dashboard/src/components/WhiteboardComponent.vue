<script setup lang="ts">
  import { Whiteboard, DefaultContext, TextContext, DrawContext, EraseContext } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";
  import IconButtonComponent from "./IconButtonComponent.vue";
  import ImageIcon from "../assets/icons/image.svg";
  import TextIcon from "../assets/icons/text.svg";
  import EditIcon from "../assets/icons/edit.svg";
  import EraseIcon from "../assets/icons/erase.svg";
  import { Color, RectComponent, Vector } from "sugar-canvas-ui";

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const whiteboard = computed(() => new Whiteboard());


  watchEffect(() => {
    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);
    }
  });
  
  function addImage(event: any) {
    event.preventDefault();
    event.target.blur();

    const dumpImageComponent = new RectComponent();

    dumpImageComponent.size = new Vector(100, 100);
    dumpImageComponent.backgroundColor = new Color(255, 0, 0, 100);

    const defaultContext = whiteboard.value.setContext(DefaultContext);
    defaultContext.addComponent(dumpImageComponent);
  }

  function addText(event: any) {
    event.preventDefault();
    event.target.blur();

    const textContext = whiteboard.value.setContext(TextContext);
    textContext.addTextComponent();
  }

  function addDrawing(event: any) {
    event.preventDefault();
    event.target.blur();

    whiteboard.value.setContext(DrawContext)
  }

  function selectErase(event: any) {
    event.preventDefault();
    event.target.blur();

    whiteboard.value.setContext(EraseContext);
  }
</script>

<template>
  <canvas ref="canvasRef"></canvas>
  <div class="fixed top-0 pointer-events-none">
    <div class="h-screen flex flex-col justify-center items-center gap-2 px-2 pointer-events-none">
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="addImage"><ImageIcon /></IconButtonComponent>
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="addText"><TextIcon /></IconButtonComponent>
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="addDrawing"><EditIcon/></IconButtonComponent>
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="selectErase"><EraseIcon /></IconButtonComponent>
    </div>
  </div>
</template>