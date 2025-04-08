<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Button-Klick Protokoll</h1>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th class="px-6 py-3 border-b border-gray-300 bg-gray-100">
              Button
            </th>
            <th class="px-6 py-3 border-b border-gray-300 bg-gray-100">
              IP-Adresse
            </th>
            <th class="px-6 py-3 border-b border-gray-300 bg-gray-100">
              Zeitstempel
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="click in clicks" :key="click.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 border-b border-gray-300">
              {{ click.buttonText }}
            </td>
            <td class="px-6 py-4 border-b border-gray-300">
              {{ click.ipAddress }}
            </td>
            <td class="px-6 py-4 border-b border-gray-300">
              {{ formatDate(click.timestamp) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Click {
  id: number;
  buttonText: string;
  ipAddress: string;
  timestamp: string;
}

const clicks = ref<Click[]>([]);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("de-DE");
};

const fetchClicks = async () => {
  try {
    clicks.value = await $fetch("/api/clicks");
  } catch (error) {
    console.error("Fehler beim Laden der Klick-Daten:", error);
  }
};

onMounted(() => {
  fetchClicks();
});
</script>
