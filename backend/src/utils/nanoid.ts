// utils/nanoid.ts
import { customAlphabet } from 'nanoid'

// Using a simple alphabet for demonstration.
// You can customize this as needed.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
export const nanoid = customAlphabet(alphabet, 21)
