import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 

export function toCamelCase(str: string): string {
  if (!str) return str;

  // Handle snake_case: convert to camelCase
  if (str.includes("_")) {
    const parts = str.split("_");
    return (
      parts[0].toLowerCase() +
      parts
        .slice(1)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("")
    );
  }

  // For pure uppercase like "USA", convert entirely to lowercase
  if (str === str.toUpperCase() && str.length > 1) {
    return str.toLowerCase();
  }

  // For PascalCase, find leading uppercase sequence
  let i = 0;
  while (
    i < str.length &&
    str[i] === str[i].toUpperCase() &&
    str[i] !== str[i].toLowerCase()
  ) {
    i++;
  }

  if (i === 0) {
    return str;
  } else if (i === 1) {
    // Single leading uppercase: "Admin" → "admin"
    return str.charAt(0).toLowerCase() + str.slice(1);
  } else if (i === str.length) {
    // Entire string is uppercase: "USA" → "usa"
    return str.toLowerCase();
  } else {
    // Multiple leading uppercase: "XMLParser" → "xmlParser"
    return str.slice(0, i - 1).toLowerCase() + str.slice(i - 1);
  }
}