import { customAlphabet } from "nanoid";


const nanoAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function nanoRandom(size: number = 24) {
  return customAlphabet(nanoAlphabet, size)
}