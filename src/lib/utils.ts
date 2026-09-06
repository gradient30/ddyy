import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** React Router basename from Vite base (GitHub Pages is /ddyy/). */
export function basenameFromViteBase(base: string): string | undefined {
  if (!base || base === '/') return undefined;
  return base.replace(/\/$/, '');
}

export function routerBasename(): string | undefined {
  return basenameFromViteBase(import.meta.env.BASE_URL);
}
