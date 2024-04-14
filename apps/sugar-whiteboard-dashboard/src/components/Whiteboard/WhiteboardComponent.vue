<script setup lang="ts">
  import { Whiteboard, TextContext, DrawContext, EraseContext, ImageComponent, DefaultContext  } from "sugar-whiteboard-core"
  import { computed, onUnmounted, shallowRef, onMounted } from "vue";
  import IconButtonComponent from "../IconButtonComponent.vue";
  import MousePointerIcon from "../../assets/icons/mouse-pointer.svg";
  import ImageIcon from "../../assets/icons/image.svg";
  import TextIcon from "../../assets/icons/text.svg";
  import EditIcon from "../../assets/icons/edit.svg";
  import EraseIcon from "../../assets/icons/erase.svg";
import { Vector } from "sugar-canvas-ui";
import ControlButton from "./ControlButton.vue";
import { Context } from "sugar-whiteboard-core";

  const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
  const fileInputRef = shallowRef<HTMLCanvasElement | null>(null);

  const whiteboard = computed(() => new Whiteboard());

  const whiteboardContext = shallowRef<Context | null>(null);

  onMounted(() => {
    whiteboard.value.onContextChange(({ newContext }) => {
      whiteboardContext.value = newContext
      console.log(whiteboardContext.value)
    });

    if (canvasRef.value) {
      whiteboard.value.init(canvasRef.value);
    }
  });

  onUnmounted(() => {
    whiteboard.value.unmount();
  });

  function switchToDefaultContext() {
    whiteboard.value.setContext(DefaultContext);
  }

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
      <ControlButton :is-active-control="(() => (whiteboardContext instanceof DefaultContext))()" @click="switchToDefaultContext">
        <MousePointerIcon />
      </ControlButton>
      <ControlButton :is-active-control="false" @click="handleUploadImageClick">
        <ImageIcon />
        <input class="pointer-events-auto hidden" id="file" ref="fileInputRef" name="file" type="file" accept="image/png, image/jpeg" @change="addImage" />
      </ControlButton>  
      <ControlButton :is-active-control="(() => (whiteboardContext instanceof TextContext))()" @click="addText"><TextIcon /></ControlButton>
      <ControlButton :is-active-control="(() => (whiteboardContext instanceof DrawContext))()" @click="addDrawing"><EditIcon/></ControlButton>
      <ControlButton :is-active-control="(() => (whiteboardContext instanceof EraseContext))()" @click="selectErase"><EraseIcon /></ControlButton>
    </div>
  </div>
</template>