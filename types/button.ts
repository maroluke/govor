import type { FunctionalComponent } from "vue";
import type { LucideProps } from "lucide-vue-next";

export interface Button {
  text: string;
  icon: any;
  category: string;
  audio?: string;
}

export interface ButtonCategory {
  [key: string]: Array<{
    text: string;
    icon: string;
    audio?: string;
  }>;
}
