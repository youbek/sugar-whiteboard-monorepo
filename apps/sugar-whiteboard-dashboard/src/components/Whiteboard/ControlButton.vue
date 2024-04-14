<script setup lang="ts">
  import IconButtonComponent from '../IconButtonComponent.vue';

  const props = defineProps<{
    isActiveControl: boolean,
  }>()
</script>

<template>
  <IconButtonComponent class="pointer-events-auto bottom-10 right-20 shadow-sm border-2" :class="{'border-blue-500': isActiveControl, 'border-transparent': !isActiveControl}">
    <slot></slot>
  </IconButtonComponent>
</template>