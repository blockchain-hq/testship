import LZ from "lz-string";
import type { SharedState } from "./types";

export const getURLForSharing = (state: SharedState) => {
  console.log("getting url for sharing from: ", state);
  const baseUrl = "https://app.testship.xyz";
  try {
    const text = JSON.stringify(state);
    console.log("stringified text", text);
    const compressed = LZ.compressToEncodedURIComponent(text);
    console.log("compressed", compressed);
    return `${baseUrl}/s#state=${compressed}`;
  } catch (error) {
    console.log("Error converting state to URL: ", error);
    return null;
  }
};
