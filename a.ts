// import { SnowflakeId } from '@akashrajpurohit/snowflake-id';

// const snowflake = SnowflakeId({
//   workerId: 1,
//   epoch: 1597017600000,
// });

// console.log(snowflake.generate()); // 14755887168818983731200
import { nanoRandom } from './src/utils/cipher';
console.log(nanoRandom(32))