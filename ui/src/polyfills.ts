// Polyfill Buffer and buffer for browser environment
// This must run before any other code that might use buffer
import { Buffer } from "buffer";
import * as bufferModule from "buffer";

// Make Buffer available globally
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}
if (typeof globalThis !== "undefined") {
  globalThis.Buffer = Buffer;
}

// Make buffer module available globally for dependencies that expect it
// Some dependencies use: const buffer = require('buffer') or import buffer from 'buffer'
if (typeof globalThis !== "undefined") {
  // @ts-expect-error - Making buffer module available globally
  globalThis.buffer = bufferModule;
}
if (typeof window !== "undefined") {
  // @ts-expect-error
  window.buffer = bufferModule;
}

// Export for use in other files if needed
export { Buffer };
export default bufferModule;

