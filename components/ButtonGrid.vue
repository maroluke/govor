<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import type { Button } from "~/types/button";
import buttonData from "~/data/buttons.json";
import * as icons from "lucide-vue-next";

interface ButtonItem {
  text: string;
  icon: string;
  audio: string;
}

interface ButtonUsage {
  [key: string]: number;
}

const sortByUsage = ref(true);

onMounted(() => {
  const savedUsage = localStorage.getItem("buttonUsage");
  if (savedUsage) {
    buttonUsage.value = JSON.parse(savedUsage);
  }

  const savedSorting = localStorage.getItem("sortByUsage");
  if (savedSorting !== null) {
    sortByUsage.value = savedSorting === "true";
  }
});

const toggleSorting = () => {
  sortByUsage.value = !sortByUsage.value;
  localStorage.setItem("sortByUsage", sortByUsage.value.toString());
};

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

const buttonUsage = ref<ButtonUsage>({});

const updateButtonUsage = (text: string) => {
  buttonUsage.value[text] = (buttonUsage.value[text] || 0) + 1;
  localStorage.setItem("buttonUsage", JSON.stringify(buttonUsage.value));
};

const buttons = computed(() => {
  const result: Button[] = [];
  const uniqueButtons = new Set<string>();

  Object.entries(buttonData).forEach(([category, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item: ButtonItem) => {
        if (
          item.text !== "Da" &&
          item.text !== "Ne" &&
          item.text &&
          item.icon &&
          !uniqueButtons.has(item.text)
        ) {
          uniqueButtons.add(item.text);
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

const sortedButtons = computed(() => {
  const sorted = [...buttons.value];
  if (sortByUsage.value) {
    return sorted.sort((a, b) => {
      const usageA = buttonUsage.value[a.text] || 0;
      const usageB = buttonUsage.value[b.text] || 0;
      return usageB - usageA;
    });
  } else {
    return sorted.sort((a, b) => a.text.localeCompare(b.text));
  }
});

const categories = computed(() => {
  return Object.keys(buttonData);
});

const getButtonsByCategory = (category: string) => {
  return buttons.value.filter((button) => button.category === category);
};

const playAudio = (audio: string, text: string): void => {
  if (!audio) return;
  const audioPath = `/audio/${audio}.mp3`;
  const audioElement = new Audio(audioPath);
  audioElement.play().catch((error) => {
    console.error("Fehler beim Abspielen des Audios:", error);
  });
  updateButtonUsage(text);
};
</script>

<template>
  <div class="h-screen w-screen p-4 overflow-auto">
    <!-- Header mit Toggle -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm">Poredaj prema korištenju</span>
        <button
          @click="toggleSorting"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            sortByUsage ? 'bg-indigo-600' : 'bg-gray-200',
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              sortByUsage ? 'translate-x-6' : 'translate-x-1',
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Fixierte Ja/Nein-Buttons -->
    <div class="flex gap-4 mb-4">
      <button
        @click="playAudio('da', 'Da')"
        class="flex flex-1 gap-3 items-center justify-center p-4 rounded-lg transition-colors duration-200 h-20 w-full bg-green-100 hover:bg-green-200 text-green-800"
      >
        <component :is="icons.Check" class="w-8 h-8" />
        <span class="text-sm text-center">Da</span>
        <span class="text-xs mt-1 opacity-50"
          >({{ buttonUsage["Da"] || 0 }})</span
        >
      </button>
      <button
        @click="playAudio('ne', 'Ne')"
        class="flex flex-1 gap-3 items-center justify-center p-4 rounded-lg transition-colors duration-200 h-20 w-full bg-red-100 hover:bg-red-200 text-red-800"
      >
        <component :is="icons.X" class="w-8 h-8" />
        <span class="text-sm text-center">Ne</span>
        <span class="text-xs mt-1 opacity-50"
          >({{ buttonUsage["Ne"] || 0 }})</span
        >
      </button>
    </div>

    <!-- Buttons nach Kategorien -->
    <template v-if="!sortByUsage">
      <div v-for="category in categories" :key="category" class="mb-6">
        <h2 class="text-lg font-semibold mb-3">{{ category }}</h2>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          <button
            v-for="button in getButtonsByCategory(category)"
            :key="button.text"
            @click="playAudio(button.audio, button.text)"
            :class="[
              'flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-200 h-32',
              categoryColors[category as keyof typeof categoryColors]
            ]"
          >
            <component :is="button.icon" class="w-8 h-8 mb-2" />
            <span class="text-sm text-center">{{ button.text }}</span>
            <span class="text-xs mt-1 opacity-50"
              >({{ buttonUsage[button.text] || 0 }})</span
            >
          </button>
        </div>
      </div>
    </template>

    <!-- Buttons nach Nutzung sortiert -->
    <template v-else>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <button
          v-for="button in sortedButtons"
          :key="button.text"
          @click="playAudio(button.audio, button.text)"
          :class="[
            'flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-200 h-32',
            categoryColors[button.category as keyof typeof categoryColors]
          ]"
        >
          <component :is="button.icon" class="w-8 h-8 mb-2" />
          <span class="text-sm text-center">{{ button.text }}</span>
          <span class="text-xs mt-1 opacity-50"
            >({{ buttonUsage[button.text] || 0 }})</span
          >
        </button>
      </div>
    </template>
  </div>
</template>
