import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toCamelCase = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
