<script setup lang="ts">
import { ChartNoAxesCombined, Home, Heart } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isAdminPage = computed(() => route.path === "/admin");

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const handleSortingChange = (value: boolean) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex justify-between">
        <div class="flex flex-col gap-8 w-full sm:flex-row">
          <p
            to="/"
            class="order-2 text-xl font-bold text-gray-800 grow sm:order-1"
          >
            <span class="text-2xl">Govor</span>
            <span class="text-sm block font-normal mt-2"
              >Potpomognuta komunikacija</span
            >
            <span class="text-sm flex gap-2 items-center font-normal">
              Najdražoj ujni!
            </span>
            <span class="text-sm block font-normal">Marko Lukac, 2025.</span>
            <Heart class="fill-red-500 stroke-red-500 mt-3" />
          </p>
          <div
            class="order-1 shrink flex justify-between items-center gap-6 sm:order-2"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 leading-tight"
                >Poredaj prema korištenju</span
              >
              <button
                type="button"
                @click="handleSortingChange(!props.modelValue)"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  props.modelValue ? 'bg-indigo-600' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    props.modelValue ? 'translate-x-6' : 'translate-x-1',
                  ]"
                />
              </button>
            </div>
            <span class="text-gray-400 w-px h-10 bg-gray-200"></span>
            <template v-if="isAdminPage">
              <NuxtLink
                to="/"
                class="border-2 border-gray-200 rounded-full shrink text-gray-300 bg-transparent hover:bg-white p-2 text-sm font-medium flex items-center hover:text-gray-500 hover:border-gray-500"
              >
                <Home />
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                to="/admin"
                class="border-2 border-gray-200 rounded-full shrink text-gray-300 bg-transparent hover:bg-white p-2 text-sm font-medium flex items-center hover:text-gray-500 hover:border-gray-500"
              >
                <ChartNoAxesCombined />
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
