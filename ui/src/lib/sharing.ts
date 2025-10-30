import LZ from "lz-string";
import type { AppState } from "./types";

export const encodeStateToURL = (state: AppState, baseUrl: string) => {
  try {
    const text = JSON.stringify(state);
    const compressed = LZ.compressToEncodedURIComponent(text);
    return `${baseUrl}/s#state=${compressed}`;
  } catch (error) {
    console.error("Error encoding state to URL: ", error);
    return null;
  }
};

export const decodeStateFromURL = (): AppState | null => {
  try {
    const hash = window.location.hash;
    if (!hash.includes("state=")) return null;

    const match = hash.match(/state=([^&]+)/);
    if (!match) return null;

    const decompressed = LZ.decompressFromEncodedURIComponent(match[1]);
    if (!decompressed) return null;

    return JSON.parse(decompressed);
  } catch (error) {
    console.error("Error decoding state from URL: ", error);
    return null;
  }
};
