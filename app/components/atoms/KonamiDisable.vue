<script setup lang="ts">
const isActive = useKonami()
</script>

<template>
  <button
    v-if="isActive"
    type="button"
    class="konamiDisable text-red-600 bottom-3 left-3 fixed z-1000"
    @click="isActive = false"
  >
    Exit Konami Mode
  </button>
</template>
