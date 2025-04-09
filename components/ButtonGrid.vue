<script setup lang="ts">
import { computed, ref, onMounted, reactive } from "vue";
import type { Button } from "~/types/button";
import buttonData from "~/data/buttons.json";
import * as icons from "lucide-vue-next";
import { Heart } from "lucide-vue-next";

// Interface für die AudioBuffer
interface PreloadedAudioBuffers {
  [key: string]: AudioBuffer;
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

type Category = keyof typeof categoryColors; // Typ für Kategorien hinzufügen

const props = defineProps<{
  sortByUsage: boolean;
}>();

const buttonUsage = ref<ButtonUsage>({});
// Web Audio API Context (nur einmal erstellen)
let audioContext: AudioContext | null = null;
const preloadedAudioBuffers = reactive<PreloadedAudioBuffers>({});
const isLoadingAudio = ref(true); // Ladezustand für optionales UI-Feedback

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

onMounted(async () => {
  try {
    const savedUsage = localStorage.getItem("buttonUsage");
    if (savedUsage) {
      buttonUsage.value = JSON.parse(savedUsage);
    }
  } catch (error) {
    console.error("Fehler beim Laden aus localStorage:", error);
  }

  // AudioContext initialisieren (erst nach Nutzerinteraktion, aber hier im Mount für Preloading)
  // Beachte: In manchen Browsern muss der Context nach einer User-Geste gestartet werden.
  // Wenn es Probleme gibt, muss die Initialisierung evtl. in den ersten Klick-Handler.
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.error("Web Audio API wird nicht unterstützt", e);
    isLoadingAudio.value = false;
    return; // Ohne AudioContext kein Preloading möglich
  }

  // Funktion zum Laden und Dekodieren einer einzelnen Datei
  const loadAndDecodeAudio = async (key: string, path: string) => {
    if (!audioContext) return;
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP-Fehler ${response.status} für ${path}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await (audioContext as AudioContext).decodeAudioData(
        arrayBuffer
      );
      preloadedAudioBuffers[key] = audioBuffer;
    } catch (error) {
      console.error(
        `Fehler beim Laden/Dekodieren von ${key} (${path}):`,
        error
      );
    }
  };

  // Ladevorgänge starten
  const loadPromises: Promise<void>[] = [];
  loadPromises.push(loadAndDecodeAudio("da", "/audio/da.mp3"));
  loadPromises.push(loadAndDecodeAudio("ne", "/audio/ne.mp3"));

  buttons.value.forEach((button) => {
    if (button.audio && !preloadedAudioBuffers[button.audio]) {
      const audioPath = `/audio/${button.audio}.mp3`;
      loadPromises.push(loadAndDecodeAudio(button.audio, audioPath));
    }
  });

  // Warten, bis alle Audios geladen und dekodiert sind
  try {
    await Promise.all(loadPromises);
    console.log("Alle Audios erfolgreich vorgeladen und dekodiert.");
  } catch (error) {
    console.error("Fehler während des Audio-Preloadings:", error);
  } finally {
    isLoadingAudio.value = false; // Ladezustand beenden
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

const getButtonsByCategory = (category: string): Button[] => {
  // Rückgabetyp hinzufügen
  return buttons.value.filter((button) => button.category === category);
};

// Funktion zum Abspielen des dekodierten AudioBuffers
const playAudio = async (audioKey: string, text: string): Promise<void> => {
  if (!audioContext) {
    console.error("AudioContext nicht initialisiert.");
    return;
  }

  // Wenn der Context noch nicht durch eine User-Geste "resumed" wurde (Autoplay Policy)
  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch (e) {
      console.error("Fehler beim Fortsetzen des AudioContext:", e);
      return;
    }
  }

  const audioBuffer = preloadedAudioBuffers[audioKey];
  if (!audioBuffer) {
    console.error(
      `AudioBuffer für Schlüssel '${audioKey}' nicht gefunden oder nicht dekodiert.`
    );
    // Hier könnte man einen Fallback implementieren, z.B. direkt laden?
    return;
  }

  try {
    const source = (audioContext as AudioContext).createBufferSource(); // Quelle erstellen
    source.buffer = audioBuffer; // Buffer zuweisen
    source.connect((audioContext as AudioContext).destination); // Mit Lautsprecher verbinden
    source.start(0); // Sofort abspielen
  } catch (error) {
    console.error("Fehler beim Abspielen des AudioBuffers:", error);
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
  <!-- Full-screen Loading Overlay -->
  <div
    v-if="isLoadingAudio"
    class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
  >
    <h1 class="text-2xl font-bold text-gray-700">Govor</h1>
    <div
      class="loader ease-linear rounded-full border-2 border-t-2 border-t-black border-gray-200 h-8 w-8 mt-8"
    ></div>
  </div>

  <div class="pt-5 w-screen p-2 overflow-auto">
    <!-- Fixierte Ja/Nein-Buttons -->
    <div
      class="flex gap-2 mb-4 fixed top-0 left-0 right-0 bg-white z-10 p-2 drop-shadow-md"
    >
      <button
        @click="playAudio('da', 'Da')"
        :disabled="isLoadingAudio"
        class="flex flex-1 gap-3 items-center justify-center p-4 rounded-lg transition-colors duration-200 w-full bg-green-100 hover:bg-green-200 text-green-800 relative"
      >
        <component :is="icons.ThumbsUp" class="w-8 h-8" />
        <!-- <span class="text-sm text-center">Da</span> -->
        <span class="text-xs mt-1 opacity-40 absolute top-1 right-2"
          >({{ buttonUsage["Da"] || 0 }})</span
        >
      </button>
      <button
        @click="playAudio('ne', 'Ne')"
        :disabled="isLoadingAudio"
        class="flex flex-1 gap-3 items-center justify-center p-4 rounded-lg transition-colors duration-200 w-full bg-red-100 hover:bg-red-200 text-red-800 relative"
      >
        <component :is="icons.ThumbsDown" class="w-8 h-8" />
        <!-- <span class="text-sm text-center">Ne</span> -->
        <span class="text-xs mt-1 opacity-40 absolute top-1 right-2"
          >({{ buttonUsage["Ne"] || 0 }})</span
        >
      </button>
    </div>

    <!-- Buttons nach Kategorien -->
    <template v-if="!props.sortByUsage">
      <div v-for="category in categories" :key="category" class="mb-6 mt-20">
        <h2 class="text-lg font-semibold mb-3">{{ category }}</h2>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
        >
          <button
            v-for="button in getButtonsByCategory(category)"
            :key="button.text"
            @click="playAudio(button.audio, button.text)"
            :disabled="
              isLoadingAudio ||
              (!!button.audio && !preloadedAudioBuffers[button.audio])
            "
            :class="[
              'flex flex-col items-center justify-center px-4 py-4 rounded-lg transition-colors duration-200 relative',
              categoryColors[category as Category], // Kategorie explizit typisieren
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
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-20"
      >
        <button
          v-for="button in sortedButtons"
          :key="button.text"
          @click="playAudio(button.audio, button.text)"
          :disabled="
            isLoadingAudio ||
            (!!button.audio && !preloadedAudioBuffers[button.audio])
          "
          :class="[
            'flex flex-col items-center justify-center px-4 py-4 rounded-lg transition-colors duration-200 relative',
            categoryColors[button.category as Category], // Kategorie explizit typisieren
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

<style scoped>
/* CSS für den Ladekreis (Spinner) */
.loader {
  animation: spinner 1.2s linear infinite;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
