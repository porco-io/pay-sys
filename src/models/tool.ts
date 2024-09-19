import { tablePrefix } from "../define/consts"


export const getTableName = (name: string) => {
  return `${tablePrefix}_${name}`.toLowerCase();
}