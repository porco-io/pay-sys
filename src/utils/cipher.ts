import { customAlphabet } from "nanoid";
import { SnowflakeId } from "@akashrajpurohit/snowflake-id";

const snowflake = SnowflakeId({
  workerId: Number(process.env.SNOWFLAKE_WORKER_ID) || (process.pid + Date.now()) % 1024,
});
const nanoAlphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nanoRandom(size: number = 24) {
  return customAlphabet(nanoAlphabet, size)();
}

export function genSnowflakeId() {
  return snowflake.generate();
}
