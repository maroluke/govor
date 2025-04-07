<script setup lang="ts">
import { computed } from "vue";
import type { Button } from "~/types/button";
import buttonData from "~/data/buttons.json";
import * as icons from "lucide-vue-next";

interface ButtonItem {
  text: string;
  icon: string;
  audio: string;
}

const categoryColors = {
  "Osnovne potrebe": "bg-blue-100 hover:bg-blue-200 text-blue-800",
  Emocije: "bg-pink-100 hover:bg-pink-200 text-pink-800",
  Odgovori: "bg-green-100 hover:bg-green-200 text-green-800",
  "Društvena komunikacija": "bg-purple-100 hover:bg-purple-200 text-purple-800",
  "Zdravlje i tijelo": "bg-red-100 hover:bg-red-200 text-red-800",
  "Aktivnosti i želje": "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
  "Osobe i odnosi": "bg-indigo-100 hover:bg-indigo-200 text-indigo-800",
  Imena: "bg-gray-100 hover:bg-gray-200 text-gray-800",
};

const buttons = computed(() => {
  const result: Button[] = [];
  Object.entries(buttonData).forEach(([category, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item: ButtonItem) => {
        if (item.text && item.icon) {
          result.push({
            text: item.text,
            icon: icons[item.icon as keyof typeof icons],
            category,
            audio: item.audio,
          });
        }
      });
    }
  });
  return result;
});

const categories = computed(() => {
  return Object.keys(buttonData);
});

const getButtonsByCategory = (category: string) => {
  return buttons.value.filter((button) => button.category === category);
};

const playAudio = (audio?: string): void => {
  if (!audio) return;
  const audioPath = `/audio/${audio}.mp3`;
  const audioElement = new Audio(audioPath);
  audioElement.play().catch((error) => {
    console.error("Fehler beim Abspielen des Audios:", error);
  });
};
</script>

<template>
  <div class="h-screen w-screen p-4 overflow-auto">
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      <button
        v-for="button in buttons"
        :key="button.text"
        @click="playAudio(button.audio)"
        :class="[
          'flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-200 h-32',
          categoryColors[button.category as keyof typeof categoryColors]
        ]"
      >
        <component :is="button.icon" class="w-8 h-8 mb-2" />
        <span class="text-sm text-center">{{ button.text }}</span>
      </button>
    </div>
  </div>
</template>
