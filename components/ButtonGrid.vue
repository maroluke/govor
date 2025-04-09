<script setup lang="ts">
import { computed, ref, onMounted, reactive } from "vue";
import type { Button } from "~/types/button";
import buttonData from "~/data/buttons.json";
import * as icons from "lucide-vue-next";
import { Heart } from "lucide-vue-next";

// Interface für die vorgeladenen Audio-Objekte
interface PreloadedAudios {
  [key: string]: HTMLAudioElement;
}

interface ButtonItem {
  text: string;
  icon: string;
  audio: string;
}

interface ButtonUsage {
  [key: string]: number;
}

const categoryColors = {
  "Osnovne potrebe": "bg-blue-100 hover:bg-blue-200 text-blue-800",
  Emocije: "bg-purple-100 hover:bg-purple-200 text-purple-800",
  Odgovori: "bg-green-100 hover:bg-green-200 text-green-800",
  "Društvena komunikacija": "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
  "Zdravlje i tijelo": "bg-pink-100 hover:bg-pink-200 text-pink-800",
  Higijena: "bg-indigo-100 hover:bg-indigo-200 text-indigo-800",
  "Aktivnosti i želje": "bg-orange-100 hover:bg-orange-200 text-orange-800",
  "Osobe i odnosi": "bg-teal-100 hover:bg-teal-200 text-teal-800",
} as const;

const props = defineProps<{
  sortByUsage: boolean;
}>();

const buttonUsage = ref<ButtonUsage>({});
const preloadedAudios = reactive<PreloadedAudios>({}); // Objekt zum Speichern der Audio-Elemente

onMounted(() => {
  try {
    const savedUsage = localStorage.getItem("buttonUsage");
    if (savedUsage) {
      buttonUsage.value = JSON.parse(savedUsage);
    }
  } catch (error) {
    console.error("Fehler beim Laden aus localStorage:", error);
  }

  // Audios vorab laden
  try {
    // "Da" und "Ne" Audio vorab laden
    preloadedAudios["da"] = new Audio("/audio/da.mp3");
    preloadedAudios["da"].load(); // Optional, aber hilft manchmal beim Caching
    preloadedAudios["ne"] = new Audio("/audio/ne.mp3");
    preloadedAudios["ne"].load();

    buttons.value.forEach((button) => {
      if (button.audio && !preloadedAudios[button.audio]) {
        const audioPath = `/audio/${button.audio}.mp3`;
        preloadedAudios[button.audio] = new Audio(audioPath);
        preloadedAudios[button.audio].load(); // Optional
      }
    });
    console.log("Audios erfolgreich vorgeladen.");
  } catch (error) {
    console.error("Fehler beim Vorabladen der Audios:", error);
  }
});

const updateButtonUsage = (text: string) => {
  try {
    buttonUsage.value[text] = (buttonUsage.value[text] || 0) + 1;
    localStorage.setItem("buttonUsage", JSON.stringify(buttonUsage.value));
  } catch (error) {
    console.error("Fehler beim Speichern in localStorage:", error);
  }
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
  if (props.sortByUsage) {
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

// Funktion zum Abspielen des vorgeladenen Audios
const playAudio = async (audioKey: string, text: string): Promise<void> => {
  const audioElement = preloadedAudios[audioKey];
  if (!audioElement) {
    console.error(`Audio für Schlüssel '${audioKey}' nicht gefunden.`);
    // Fallback: Versuche, das Audio direkt zu laden, falls das Vorabladen fehlschlug
    const audioPath = `/audio/${audioKey}.mp3`;
    const fallbackAudio = new Audio(audioPath);
    fallbackAudio.play().catch((error) => {
      console.error("Fehler beim Abspielen des Fallback-Audios:", error);
    });
  } else {
    try {
      // Setze die Wiedergabezeit zurück, um den Sound von vorne abzuspielen
      audioElement.currentTime = 0;
      await audioElement.play();
    } catch (error) {
      console.error("Fehler beim Abspielen des vorgeladenen Audios:", error);
    }
  }

  // Aktualisiere localStorage
  updateButtonUsage(text);

  // Sende Klick an die API
  try {
    await $fetch("/api/log-click", {
      method: "POST",
      body: { text },
    });
  } catch (error) {
    console.error("Fehler beim Loggen des Klicks:", error);
  }
};
</script>

<template>
  <div class="pt-5 w-screen p-2 overflow-auto">
    <!-- Fixierte Ja/Nein-Buttons -->
    <div class="flex gap-2 mb-4">
      <button
        @click="playAudio('da', 'Da')"
        class="flex flex-1 gap-3 items-center justify-center p-4 rounded-lg transition-colors duration-200 h-20 w-full bg-green-100 hover:bg-green-200 text-green-800 relative"
      >
        <component :is="icons.ThumbsUp" class="w-8 h-8" />
        <span class="text-sm text-center">Da</span>
        <span class="text-xs mt-1 opacity-40 absolute top-1 right-2"
          >({{ buttonUsage["Da"] || 0 }})</span
        >
      </button>
      <button
        @click="playAudio('ne', 'Ne')"
        class="flex flex-1 gap-3 items-center justify-center p-4 rounded-lg transition-colors duration-200 h-20 w-full bg-red-100 hover:bg-red-200 text-red-800 relative"
      >
        <component :is="icons.ThumbsDown" class="w-8 h-8" />
        <span class="text-sm text-center">Ne</span>
        <span class="text-xs mt-1 opacity-40 absolute top-1 right-2"
          >({{ buttonUsage["Ne"] || 0 }})</span
        >
      </button>
    </div>

    <!-- Buttons nach Kategorien -->
    <template v-if="!props.sortByUsage">
      <div v-for="category in categories" :key="category" class="mb-6">
        <h2 class="text-lg font-semibold mb-3">{{ category }}</h2>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
        >
          <button
            v-for="button in getButtonsByCategory(category)"
            :key="button.text"
            @click="playAudio(button.audio, button.text)"
            :class="[
              'flex flex-col items-center justify-center px-4 py-4 rounded-lg transition-colors duration-200 relative',
              categoryColors[category],
            ]"
          >
            <component :is="button.icon" class="w-8 h-8 mb-2" />
            <span class="text-sm text-center">{{ button.text }}</span>
            <span class="text-xs mt-1 opacity-40 absolute top-1 right-2"
              >({{ buttonUsage[button.text] || 0 }})</span
            >
          </button>
        </div>
      </div>
    </template>

    <!-- Buttons nach Nutzung sortiert -->
    <template v-else>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
      >
        <button
          v-for="button in sortedButtons"
          :key="button.text"
          @click="playAudio(button.audio, button.text)"
          :class="[
            'flex flex-col items-center justify-center px-4 py-4 rounded-lg transition-colors duration-200 relative',
            categoryColors[button.category],
          ]"
        >
          <component :is="button.icon" class="w-8 h-8 mb-2" />
          <span class="text-sm text-center">{{ button.text }}</span>
          <span class="text-xs mt-1 opacity-40 absolute top-1 right-2"
            >({{ buttonUsage[button.text] || 0 }})</span
          >
        </button>
      </div>
    </template>
  </div>
</template>
