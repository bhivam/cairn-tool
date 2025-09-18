import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAgility(dex: number) {
  return Math.round(Math.ceil((dex - 1) / 2) + 5);
}

