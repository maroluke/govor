<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-primary-600 text-white p-4">
      <h1 class="text-2xl font-bold text-center">Aplikacija za komunikaciju</h1>
    </header>
    <main>
      <ButtonGrid />
    </main>
  </div>
</template>

<script setup lang="ts">
import ButtonGrid from "~/components/ButtonGrid.vue";
</script>
