<script setup lang="ts">
  import { Whiteboard, TextContext, DrawContext, EraseContext, ImageComponent  } from "sugar-whiteboard-core"
  import { ref, computed, watchEffect } from "vue";
  import IconButtonComponent from "./IconButtonComponent.vue";
  import ImageIcon from "../assets/icons/image.svg";
  import TextIcon from "../assets/icons/text.svg";
  import EditIcon from "../assets/icons/edit.svg";
  import EraseIcon from "../assets/icons/erase.svg";
import { Vector } from "sugar-canvas-ui";

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const fileInputRef = ref<HTMLCanvasElement | null>(null);
  const whiteboard = computed(() => new Whiteboard());


  watchEffect(() => {
    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);
    }
  });


  function handleUploadImageClick(event: any) {
    event.stopPropagation();

    fileInputRef.value?.click()
  }

  function addImage(event: any) {
    const files = event?.target?.files as FileList;
    if(!files.length) return;

    const fileSource = URL.createObjectURL(files[0]);
    const imageComponent = new ImageComponent({
      source: fileSource,
      size: new Vector(512, 512),
      keepAspectRatio: true 
    });

    whiteboard.value.getContext().addComponent(imageComponent);
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

    whiteboard.value.setContext(DrawContext);
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
        <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="handleUploadImageClick">
          <ImageIcon />
          <input class="pointer-events-auto hidden" id="file" ref="fileInputRef" name="file" type="file" accept="image/png, image/jpeg" @change="addImage" />
        </IconButtonComponent>  
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="addText"><TextIcon /></IconButtonComponent>
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="addDrawing"><EditIcon/></IconButtonComponent>
      <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm" @click="selectErase"><EraseIcon /></IconButtonComponent>
    </div>
  </div>
</template>