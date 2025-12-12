import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fonction utilitaire pour regrouper les classes CSS (nécessaire pour Tailwind CSS)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}