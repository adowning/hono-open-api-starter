import * as path from 'path';

// Converts a string to a simplified ID (lowercase, no spaces).
export const ToID = (s: string): string => {
  return s.toLowerCase().replace(/[\s\/]+/g, '-');
};

// Joins path segments.
export const JoinPath = (...paths: string[]): string => {
  return path.join(...paths);
};

// Converts a Buffer or byte array to a string.
export const B2S = (b: Buffer | Uint8Array): string => {
  return Buffer.from(b).toString('utf8');
};

// Joins a file path to a directory path.
export const JoinFilePath = (dir: string, file: string): string => {
  return path.join(dir, file);
};
