<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Admin-Bereich</h1>

    <!-- Statistiken -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-2">Gesamtklicks</h3>
        <p class="text-3xl">{{ totalClicks }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-2">Eindeutige IPs</h3>
        <p class="text-3xl">{{ uniqueIPs }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-2">Beliebtester Button</h3>
        <p class="text-3xl">{{ mostClickedButton }}</p>
      </div>
    </div>

    <!-- Filter und Suche -->
    <div class="mb-6 flex gap-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Suche nach Button oder IP..."
        class="flex-1 p-2 border rounded"
      />
      <button
        @click="exportData"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Exportieren
      </button>
      <button
        @click="deleteAllClicks"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Alle Daten löschen
      </button>
    </div>

    <!-- Tabelle -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th
              class="px-6 py-3 border-b border-gray-300 bg-gray-100 cursor-pointer"
              @click="sortBy('buttonText')"
            >
              Button
              {{
                sortColumn === "buttonText"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
            <th
              class="px-6 py-3 border-b border-gray-300 bg-gray-100 cursor-pointer"
              @click="sortBy('ipAddress')"
            >
              IP-Adresse
              {{
                sortColumn === "ipAddress"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
            <th
              class="px-6 py-3 border-b border-gray-300 bg-gray-100 cursor-pointer"
              @click="sortBy('timestamp')"
            >
              Zeitstempel
              {{
                sortColumn === "timestamp"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : ""
              }}
            </th>
            <th class="px-6 py-3 border-b border-gray-300 bg-gray-100">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="click in filteredClicks"
            :key="click.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 border-b border-gray-300">
              {{ click.buttonText }}
            </td>
            <td class="px-6 py-4 border-b border-gray-300">
              {{ click.ipAddress }}
            </td>
            <td class="px-6 py-4 border-b border-gray-300">
              {{ formatDate(click.timestamp) }}
            </td>
            <td class="px-6 py-4 border-b border-gray-300">
              <button
                @click="deleteClick(click.id)"
                class="text-red-500 hover:text-red-700"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Click {
  id: number;
  buttonText: string;
  ipAddress: string;
  timestamp: string;
}

const clicks = ref<Click[]>([]);
const searchTerm = ref("");
const sortColumn = ref("timestamp");
const sortDirection = ref("desc");

const filteredClicks = computed(() => {
  let result = [...clicks.value];

  // Filterung
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter(
      (click) =>
        click.buttonText.toLowerCase().includes(term) ||
        click.ipAddress.toLowerCase().includes(term)
    );
  }

  // Sortierung
  result.sort((a, b) => {
    const aValue = a[sortColumn.value as keyof Click];
    const bValue = b[sortColumn.value as keyof Click];

    if (sortDirection.value === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return result;
});

const totalClicks = computed(() => clicks.value.length);
const uniqueIPs = computed(
  () => new Set(clicks.value.map((click) => click.ipAddress)).size
);
const mostClickedButton = computed(() => {
  const counts = clicks.value.reduce((acc, click) => {
    acc[click.buttonText] = (acc[click.buttonText] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("de-DE");
};

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const fetchClicks = async () => {
  try {
    clicks.value = await $fetch("/api/clicks");
  } catch (error) {
    console.error("Fehler beim Laden der Klick-Daten:", error);
  }
};

const deleteClick = async (id: number) => {
  try {
    await $fetch(`/api/clicks/${id}`, { method: "DELETE" });
    await fetchClicks();
  } catch (error) {
    console.error("Fehler beim Löschen des Klicks:", error);
  }
};

const deleteAllClicks = async () => {
  if (confirm("Sind Sie sicher, dass Sie alle Daten löschen möchten?")) {
    try {
      await $fetch("/api/clicks", { method: "DELETE" });
      await fetchClicks();
    } catch (error) {
      console.error("Fehler beim Löschen aller Klicks:", error);
    }
  }
};

const exportData = () => {
  const data = JSON.stringify(clicks.value, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "button-clicks.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onMounted(() => {
  fetchClicks();
});
</script>
