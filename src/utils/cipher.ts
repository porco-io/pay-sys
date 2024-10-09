import nanoid from "nanoid";

const nanoAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function nanoRandom(size: number = 24) {
  return nanoid.customAlphabet(nanoAlphabet, size)();
}