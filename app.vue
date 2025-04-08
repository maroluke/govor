<template>
  <div>
    <NuxtPage :sort-by-usage="sortByUsage" />

    <Navigation
      v-model="sortByUsage"
      @update:model-value="handleSortingChange"
    />
  </div>
</template>

<script setup lang="ts">
import Navigation from "~/components/Navigation.vue";
import ButtonGrid from "~/components/ButtonGrid.vue";
import { Heart } from "lucide-vue-next";
import { ref, onMounted } from "vue";

const sortByUsage = ref(true);

onMounted(() => {
  const savedSorting = localStorage.getItem("sortByUsage");
  if (savedSorting !== null) {
    sortByUsage.value = savedSorting === "true";
  }
});

const handleSortingChange = (value: boolean) => {
  sortByUsage.value = value;
  localStorage.setItem("sortByUsage", value.toString());
};
</script>
