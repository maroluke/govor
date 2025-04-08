<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
  label: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};

const sortByUsage = computed(() => props.modelValue);
</script>
<template>
  <div class="flex justify-between items-center mb-4">
    <div class="flex items-center gap-2">
      <span class="text-sm">{{ label }}</span>
      <button
        type="button"
        @click="toggle"
        :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          modelValue ? 'bg-indigo-600' : 'bg-gray-200',
        ]"
      >
        <span
          :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            modelValue ? 'translate-x-6' : 'translate-x-1',
          ]"
        />
      </button>
    </div>
  </div>
</template>
