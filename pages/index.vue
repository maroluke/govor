<template>
  <div class="min-h-screen bg-gray-50">
    <main>
      <ButtonGrid :sort-by-usage="sortByUsage" />
    </main>
  </div>
</template>

<script setup lang="ts">
import ButtonGrid from "~/components/ButtonGrid.vue";

const props = defineProps<{
  sortByUsage: boolean;
}>();
</script>
