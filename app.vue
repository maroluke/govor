<template>
  <div class="min-h-screen bg-gray-50">
    <main>
      <ButtonGrid />
    </main>
    <div class="flex gap-2 justify-center items-center pt-5 pb-16">
      <Heart class="fill-red-500 stroke-red-500" /> Najdražoj ujni, za brz
      oporavak!
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonGrid from "~/components/ButtonGrid.vue";
import { Heart } from "lucide-vue-next";
</script>
